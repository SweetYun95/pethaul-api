const express = require('express')
const { Like, Item, ItemImage } = require('../models')
const { isLoggedIn } = require('./middlewares')
const router = express.Router()

//조회할때 조건은 req.user.id고 받아와야 할 데이터는 상품id/상품이름/가격/상품이미지입니당

/** 내가 좋아요한 상품 목록 조회 */
router.get('/me', isLoggedIn, async (req, res) => {
   try {
      const likes = await Like.findAll({
         where: { userId: req.user.id },
         include: [
            {
               model: Item,
               attributes: ['id', 'itemNm', 'price'],
               include: [
                  {
                     model: ItemImage,
                     attributes: ['id', 'oriImgName', 'imgUrl', 'repImgYn'],
                  },
               ],
            },
         ],
      })

      res.status(200).json({
         success: true,
         items: likes.map((like) => like.Item), //상품 데이터만 뽑아서 프론트로 보낸다.
      })
   } catch (err) {
      res.status(500).json({ message: '좋아요 상품 조회 실패' })
   }
})
// 좋아요 토글로?
router.post('/:itemId', isLoggedIn, async (req, res) => {
   const { itemId } = req.params
   try {
      // 현재 유저가 이 상품을 좋아요 했는지 확인
      const existing = await Like.findOne({
         where: { userId: req.user.id, itemId },
      })

      if (existing) {
         // 이미 좋아요 → 취소
         await existing.destroy()
         return res.status(200).json({ success: true, liked: false })
      } else {
         // 좋아요 추가
         await Like.create({ userId: req.user.id, itemId })
         return res.status(201).json({ success: true, liked: true })
      }
   } catch (err) {
      console.error(err)
      res.status(500).json({ message: '좋아요 토글 실패' })
   }
})

module.exports = router
