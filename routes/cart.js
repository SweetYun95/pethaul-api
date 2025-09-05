// routes/cart.js
const express = require('express')
const router = express.Router()
const { Cart, CartItem, Item, ItemImage } = require('../models')
const { isLoggedIn } = require('./middlewares')

// 장바구니 조회
router.get('/:id', isLoggedIn, async (req, res, next) => {
   try {
      const cart = await Cart.findOne({
         where: { userId: req.user.id },
         include: {
            model: CartItem,
            include: {
               model: Item,
               attributes: ['id', 'itemNm', 'price'],
               include: [{ model: ItemImage, attributes: ['id', 'oriImgName', 'imgUrl', 'repImgYn'] }],
            },
         },
      })

      if (!cart) return res.json([])

      return res.json(cart.CartItems)
   } catch (err) {
      return next(err)
   }
})

// 장바구니에 상품 추가
router.post('/add', isLoggedIn, async (req, res, next) => {
   const { itemId, count } = req.body
   try {
      if (!itemId || !Number.isInteger(Number(count)) || Number(count) <= 0) {
         const e = new Error('유효하지 않은 요청입니다. (itemId, count)')
         e.status = 400
         return next(e)
      }

      let cart = await Cart.findOne({ where: { userId: req.user.id } })
      if (!cart) {
         cart = await Cart.create({ userId: req.user.id })
      }

      const [cartItem, created] = await CartItem.findOrCreate({
         where: { cartId: cart.id, itemId },
         defaults: { count },
      })

      if (!created) {
         cartItem.count += Number(count)
         await cartItem.save()
      }

      return res.json({ success: true, message: '장바구니에 상품이 추가되었습니다.' })
   } catch (err) {
      return next(err)
   }
})

// 장바구니 상품 수량 수정
router.put('/update/:itemId', isLoggedIn, async (req, res, next) => {
   const { itemId } = req.params
   const { count } = req.body
   try {
      const cart = await Cart.findOne({ where: { userId: req.user.id } })
      if (!cart) {
         const e = new Error('장바구니 없음')
         e.status = 404
         return next(e)
      }

      const cartItem = await CartItem.findOne({ where: { cartId: cart.id, itemId } })
      if (!cartItem) {
         const e = new Error('항목을 찾을 수 없습니다.')
         e.status = 404
         return next(e)
      }

      const n = Number(count)
      if (!Number.isInteger(n) || n <= 0) {
         const e = new Error('count는 양의 정수여야 합니다.')
         e.status = 400
         return next(e)
      }

      cartItem.count = n
      await cartItem.save()
      return res.json({ success: true, message: '수량이 수정되었습니다.' })
   } catch (err) {
      return next(err)
   }
})

// 장바구니 항목 삭제

router.delete('/delete/:itemId', isLoggedIn, async (req, res, next) => {
   try {
      const { itemId } = req.params
      const cart = await Cart.findOne({ where: { userId: req.user.id } })
      if (!cart) {
         const e = new Error('장바구니 없음')
         e.status = 404
         return next(e)
      }

      const deleted = await CartItem.destroy({ where: { cartId: cart.id, itemId } })
      if (!deleted) {
         const e = new Error('항목 없음')
         e.status = 404
         return next(e)
      }

      return res.json({ success: true, message: '삭제 완료' })
   } catch (err) {
      return next(err)
   }
})

module.exports = router
