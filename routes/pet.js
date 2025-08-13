// routes/pet.js
const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { sequelize, Pet, PetImage } = require('../models')
const { isLoggedIn } = require('./middlewares')

const router = express.Router()

// uploads 폴더 준비
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
         const decoded = decodeURIComponent(file.originalname)
         const ext = path.extname(decoded)
         const basename = path.basename(decoded, ext)
         cb(null, basename + Date.now() + ext)
      },
   }),
   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

/** 펫 등록 (이미지 포함)
 * [POST] /
 * form-data: petName, petType, breed, gender, age, (files) img[]
 */
router.post('/', isLoggedIn, upload.array('img'), async (req, res, next) => {
   const t = await sequelize.transaction()
   try {
      const { petName, petType, breed, gender } = req.body
      const age = Number(req.body.age ?? 0)

      // 1) 펫 생성
      const pet = await Pet.create({ userId: req.user.id, petName, petType, breed, gender, age }, { transaction: t })

      // 2) 이미지 저장
      let petImages = []
      if (req.files?.length > 0) {
         petImages = req.files.map((file, idx) => ({
            oriImgName: file.originalname, // 컬럼명에 맞게 조정
            imgUrl: `/uploads/${file.filename}`, // 프로젝트 컬럼이 url이면 url로 변경
            petId: pet.id,
         }))
         await PetImage.bulkCreate(petImages, { transaction: t })
      }

      await t.commit()
      res.status(201).json({
         success: true,
         message: '펫이 성공적으로 등록되었습니다.',
         pet,
         petImages,
      })
   } catch (error) {
      await t.rollback()
      console.error('[펫 등록 에러]', error)
      next({ status: 500, message: '펫 등록 중 오류가 발생했습니다.' })
   }
})

/** 펫 수정 (이미지 재업로드 시 기존 이미지 전부 교체)
 * [PUT] /edit/:id
 * form-data 가능(이미지 교체 시 img[] 포함)
 */
router.put('/edit/:id', isLoggedIn, upload.array('img'), async (req, res, next) => {
   try {
      const { petName, petType, breed, gender } = req.body
      const age = Number(req.body.age ?? 0)
      const pet = await Pet.findByPk(req.params.id)

      if (!pet) {
         const error = new Error('해당 펫을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }
      if (pet.userId !== req.user.id) {
         const error = new Error('권한이 없습니다.')
         error.status = 403
         return next(error)
      }

      await pet.update({ petName, petType, breed, gender, age })

      // 파일이 올라오면 기존 이미지 교체
      if (req.files && req.files.length > 0) {
         await PetImage.destroy({ where: { petId: pet.id } })
         const petImages = req.files.map((file, idx) => ({
            oriImgName: file.originalname,
            imgUrl: `/uploads/${file.filename}`,
            petId: pet.id,
            isPrimary: idx === 0,
            sortOrder: idx,
         }))
         await PetImage.bulkCreate(petImages)
      }

      res.json({
         success: true,
         message: '펫 정보를 성공적으로 수정했습니다.',
      })
   } catch (error) {
      error.status = 500
      error.message = '펫 수정 중 오류가 발생했습니다.'
      next(error)
   }
})

/** 펫 삭제
 * [DELETE] /:id
 */
router.delete('/:id', isLoggedIn, async (req, res, next) => {
   try {
      const pet = await Pet.findByPk(req.params.id)
      if (!pet) {
         const error = new Error('해당 펫을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }
      if (pet.userId !== req.user.id) {
         const error = new Error('권한이 없습니다.')
         error.status = 403
         return next(error)
      }

      await pet.destroy()
      res.status(200).json({ success: true, message: '펫이 삭제되었습니다.' })
   } catch (error) {
      error.status = 500
      error.message = '펫 삭제 중 오류가 발생했습니다.'
      next(error)
   }
})

/** 회원이 등록한 펫 목록 조회 (이미지 포함)
 * [GET] /
 */
router.get('/', isLoggedIn, async (req, res, next) => {
   try {
      const pets = await Pet.findAll({
         where: { userId: req.user.id },
         include: [
            {
               model: PetImage,
               as: 'images',
               attributes: ['id', 'oriImgName', 'imgUrl', 'isPrimary', 'sortOrder'],
               separate: true,
               order: [
                  ['isPrimary', 'DESC'],
                  ['sortOrder', 'ASC'],
                  ['id', 'ASC'],
               ],
            },
         ],
         order: [['createdAt', 'DESC']],
      })

      res.status(200).json({
         success: true,
         message: '회원이 등록한 펫 목록을 성공적으로 불러왔습니다.',
         pets,
      })
   } catch (error) {
      error.status = 500
      error.message = '데이터를 불러오는 중 오류가 발생했습니다.'
      next(error)
   }
})

module.exports = router
