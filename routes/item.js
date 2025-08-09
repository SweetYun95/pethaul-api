const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { Op } = require('sequelize')
const { Item, ItemImage, Category, ItemCategory, Review, ReviewImage, User } = require('../models')
const { isAdmin, verifyToken } = require('./middlewares')
const router = express.Router()
// uploads 폴더가 없을 경우 새로 생성
try {
   fs.readdirSync('uploads')
} catch (error) {
   console.log('uploads 폴더가 없어 uploads 폴더를 생성합니다.')
   fs.mkdirSync('uploads')
}
// multer 설정
const upload = multer({
   storage: multer.diskStorage({
      destination(req, file, cb) {
         cb(null, 'uploads/')
      },
      filename(req, file, cb) {
         const decodedFileName = decodeURIComponent(file.originalname)
         const ext = path.extname(decodedFileName)
         const basename = path.basename(decodedFileName, ext)
         cb(null, basename + Date.now() + ext)
      },
   }),
   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})
/**
 * 1. 상품 등록
 */
router.post('/', verifyToken, isAdmin, upload.array('img'), async (req, res, next) => {
   try {
      if (!req.files) {
         const error = new Error('파일 업로드에 실패했습니다.')
         error.status = 400
         return next(error)
      }
      const { itemNm, price, stockNumber, itemDetail, itemSellStatus } = req.body

      let categories = []
      try {
         categories = JSON.parse(req.body.categories)
      } catch (err) {
         const error = new Error('카테고리 파싱에 실패했습니다.')
         error.status = 400
         return next(error)
      }

      const item = await Item.create({
         itemNm,
         price,
         stockNumber,
         itemDetail,
         itemSellStatus,
      })
      // 이미지 insert
      const images = req.files.map((file) => ({
         oriImgName: file.originalname,
         imgUrl: `/${file.filename}`,
         repImgYn: 'N',
         itemId: item.id,
      }))
      if (images.length > 0) images[0].repImgYn = 'Y'
      await ItemImage.bulkCreate(images)

      // 카테고리 저장 및 연결
      const categoryInstances = await Promise.all(
         categories.map(async (data) => {
            const [category] = await Category.findOrCreate({ where: { categoryName: data.trim() } })
            return category
         })
      )
      const itemCategories = categoryInstances.map((category) => ({
         itemId: item.id,
         categoryId: category.id,
      }))
      await ItemCategory.bulkCreate(itemCategories)
      res.status(201).json({
         success: true,
         message: '상품이 성공적으로 등록되었습니다.',
         item,
         images,
         categories: categoryInstances.map((c) => c.categoryName),
      })
   } catch (error) {
      error.status = 500
      error.message = '상품 등록 중 오류가 발생했습니다.'
      next(error)
   }
})
/**
 * 2. 전체 상품 불러오기
 */
router.get('/', verifyToken, async (req, res, next) => {
   try {
      const searchTerm = req.query.searchTerm || ''
      const sellCategory = req.query.sellCategory

      const whereClause = {
         ...(searchTerm && {
            itemNm: { [Op.like]: `%${searchTerm}%` },
         }),
      }

      const includeModels = [
         {
            model: ItemImage,
            attributes: ['id', 'oriImgName', 'imgUrl', 'repImgYn'],
         },
         {
            model: Category,
            attributes: ['id', 'categoryName'],
         },
      ]

      const items = await Item.findAll({
         where: whereClause,
         order: [['createdAt', 'DESC']],
         include: includeModels,
      })
      console.log('상품 데이터 확인', items)
      res.json({
         success: true,
         message: '상품 목록 조회 성공',
         items,
      })
   } catch (error) {
      error.status = 500
      error.message = '상품 목록 불러오기 실패'
      next(error)
   }
})

/**
 * 3. 특정 상품 불러오기
 */
router.get('/:id', verifyToken, async (req, res, next) => {
   try {
      const item = await Item.findOne({
         where: { id: req.params.id },
         include: [
            { model: ItemImage, attributes: ['id', 'oriImgName', 'imgUrl', 'repImgYn'] },
            {
               model: Category,
               attributes: ['id', 'categoryName'],
            },
            {
               model: Review,
               attributes: ['id', 'reviewDate', 'reviewContent'],
               include: [
                  {
                     model: ReviewImage,
                     attributes: ['id', 'oriImgName', 'imgUrl'],
                  },
                  {
                     model: User,
                     attributes: ['id', 'userId', 'name'],
                  },
               ],
            },
         ],
      })
      if (!item) {
         const error = new Error('해당 상품을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      res.json({ success: true, message: '상품 조회 성공', item })
   } catch (error) {
      error.status = 500
      error.message = '상품 조회 실패'
      next(error)
   }
})
/**
 * 4. 상품 수정
 */
router.put('/:id', verifyToken, isAdmin, upload.array('img'), async (req, res, next) => {
   try {
      const { itemNm, price, stockNumber, itemDetail, itemSellStatus, categories } = req.body
      let parsedCategories = []
      try {
         parsedCategories = JSON.parse(categories) // 문자열 → 배열
      } catch (err) {
         const error = new Error('카테고리 파싱에 실패했습니다.')
         error.status = 400
         return next(error)
      }

      const item = await Item.findByPk(req.params.id)
      if (!item) {
         const error = new Error('해당 상품을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }
      await item.update({ itemNm, price, stockNumber, itemDetail, itemSellStatus })
      if (req.files && req.files.length > 0) {
         await ItemImage.destroy({ where: { itemId: item.id } })
         const images = req.files.map((file) => ({
            oriImgName: file.originalname,
            imgUrl: `/${file.filename}`,
            repImgYn: 'N',
            itemId: item.id,
         }))
         if (images.length > 0) images[0].repImgYn = 'Y'
         await ItemImage.bulkCreate(images)
      }
      await ItemCategory.destroy({ where: { itemId: item.id } })
      const categoryInstances = await Promise.all(
         parsedCategories.map(async (data) => {
            const [category] = await Category.findOrCreate({
               where: { categoryName: data.trim() },
            })
            return category
         })
      )

      const itemCategories = categoryInstances.map((category) => ({
         itemId: item.id,
         categoryId: category.id,
      }))
      await ItemCategory.bulkCreate(itemCategories)
      res.json({ success: true, message: '상품이 성공적으로 수정되었습니다.' })
   } catch (error) {
      error.status = 500
      error.message = '상품 수정 실패'
      next(error)
   }
})
/**
 * 5. 상품 삭제
 */
router.delete('/:id', verifyToken, isAdmin, async (req, res, next) => {
   try {
      const item = await Item.findByPk(req.params.id)
      if (!item) {
         const error = new Error('상품을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }
      await item.destroy()
      res.json({ success: true, message: '상품이 삭제되었습니다.' })
   } catch (error) {
      error.status = 500
      error.message = '상품 삭제 실패'
      next(error)
   }
})
module.exports = router
