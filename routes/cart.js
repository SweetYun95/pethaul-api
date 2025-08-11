const express = require('express')
const router = express.Router()
const { Cart, CartItem, Item, ItemImage } = require('../models')
const { isLoggedIn } = require('./middlewares')

//  장바구니 조회

router.get('/:id', isLoggedIn, async (req, res) => {
   try {
      const cart = await Cart.findOne({
         where: { userId: req.user.id },
         include: {
            model: CartItem,
            include: {
               model: Item, // 상품 정보까지 포함
               attributes: ['id', 'itemNm', 'price'],
               include: [
                  {
                     model: ItemImage,
                     attributes: ['id', 'oriImgName', 'imgUrl', 'repImgYn'],
                  },
               ],
            },
         },
      })
      if (!cart) return res.json([])

      res.json(cart.CartItems)
   } catch (err) {
      res.status(500).json({ message: '장바구니 조회 실패' })
   }
})

//  장바구니에 상품 추가
router.post('/add', isLoggedIn, async (req, res) => {
   const { itemId, count } = req.body
   try {
      let cart = await Cart.findOne({ where: { userId: req.user.id } })
      if (!cart) {
         cart = await Cart.create({ userId: req.user.id })
      }

      const [cartItem, created] = await CartItem.findOrCreate({
         where: { cartId: cart.id, itemId },
         defaults: { count },
      })

      if (!created) {
         cartItem.count += count
         await cartItem.save()
      }

      res.json({ message: '장바구니에 상품이 추가되었습니다.' })
   } catch (err) {
      res.status(500).json({ message: '추가 실패' })
   }
})

//  장바구니 상품 수량 수정
router.put('/update/:itemId', isLoggedIn, async (req, res) => {
   const { itemId } = req.params
   const { count } = req.body
   try {
      const cart = await Cart.findOne({ where: { userId: req.user.id } })
      if (!cart) return res.status(404).json({ message: '장바구니 없음' })

      const cartItem = await CartItem.findOne({
         where: { cartId: cart.id, itemId },
      })
      if (!cartItem) return res.status(404).json({ message: '항목을 찾을 수 없습니다.' })

      cartItem.count = count
      await cartItem.save()
      res.json({ message: '수량이 수정되었습니다.' })
   } catch (err) {
      res.status(500).json({ message: '수정 실패' })
   }
})

// 장바구니 항목 삭제
router.delete('/delete/:itemId', isLoggedIn, async (req, res) => {
   try {
      const { itemId } = req.params
      const cart = await Cart.findOne({ where: { userId: req.user.id } })
      if (!cart) return res.status(404).json({ message: '장바구니 없음' })

      const deleted = await CartItem.destroy({
         where: { cartId: cart.id, itemId },
      })

      if (!deleted) return res.status(404).json({ message: '항목 없음' })
      res.json({ message: '삭제 완료' })
   } catch (err) {
      res.status(500).json({ message: '삭제 실패' })
   }
})
module.exports = router
