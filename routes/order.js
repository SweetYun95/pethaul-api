// routes/order.js
const express = require('express')
const { Order, OrderItem, Item } = require('../models')
const { isLoggedIn } = require('./middlewares')

const router = express.Router()

// 주문 생성
router.post('/', isLoggedIn, async (req, res) => {
   const t = await Order.sequelize.transaction()
   try {
      const { items } = req.body // [{ itemId, price, quantity }]
      if (!items || items.length === 0) {
         return res.status(400).json({ message: '주문할 상품이 없습니다.' })
      }

      // 재고 체크
      for (const item of items) {
         const product = await Item.findByPk(item.itemId, { transaction: t })
         if (!product) {
            await t.rollback()
            return res.status(404).json({ message: `상품 ID ${item.itemId}을 찾을 수 없습니다.` })
         }
         if (product.stockNumber < item.quantity) {
            await t.rollback()
            return res.status(400).json({ message: `${product.itemNm} 상품 재고가 부족합니다.` })
         }
      }

      // 주문 생성
      const order = await Order.create(
         {
            userId: req.user.id,
            orderDate: new Date(),
            orderStatus: 'ORDER',
         },
         { transaction: t }
      )

      // 주문상품 생성 + 재고 차감
      for (const item of items) {
         await OrderItem.create(
            {
               orderId: order.id,
               itemId: item.itemId,
               orderPrice: item.price,
               count: item.quantity,
            },
            { transaction: t }
         )

         // 재고 차감
         const product = await Item.findByPk(item.itemId, { transaction: t })
         product.stockNumber -= item.quantity
         await product.save({ transaction: t })
      }

      await t.commit()
      res.status(201).json({ message: '주문이 완료되었습니다.', orderId: order.id })
   } catch (err) {
      await t.rollback()
      console.error(err)
      res.status(500).json({ message: '서버 오류', error: err })
   }
})

// 주문 목록 조회
router.get('/', isLoggedIn, async (req, res) => {
   try {
      const orders = await Order.findAll({
         where: { userId: req.user.id },
         include: [
            {
               model: Item,
               through: { attributes: ['orderPrice', 'count'] },
            },
         ],
      })
      res.json(orders)
   } catch (err) {
      console.error(err)
      res.status(500).json({ message: '서버 오류', error: err })
   }
})

// 주문 상세 조회
router.get('/:id', isLoggedIn, async (req, res) => {
   try {
      const order = await Order.findOne({
         where: { id: req.params.id, userId: req.user.id },
         include: [
            {
               model: Item,
               through: { attributes: ['orderPrice', 'count'] },
            },
         ],
      })
      if (!order) {
         return res.status(404).json({ message: '주문을 찾을 수 없습니다.' })
      }
      res.json(order)
   } catch (err) {
      console.error(err)
      res.status(500).json({ message: '서버 오류', error: err })
   }
})

// 주문 취소
router.patch('/:id/cancel', isLoggedIn, async (req, res) => {
   const t = await Order.sequelize.transaction()
   try {
      const order = await Order.findOne({
         where: { id: req.params.id, userId: req.user.id },
         include: [
            {
               model: Item,
               through: { attributes: ['count'] },
            },
         ],
         transaction: t,
      })

      if (!order) {
         await t.rollback()
         return res.status(404).json({ message: '주문을 찾을 수 없습니다.' })
      }

      // 재고 복구
      for (const item of order.Items) {
         const product = await Item.findByPk(item.id, { transaction: t })
         product.stockNumber += item.OrderItem.count
         await product.save({ transaction: t })
      }

      // 상태 변경
      order.orderStatus = 'CANCEL'
      await order.save({ transaction: t })

      await t.commit()
      res.json({ message: '주문이 취소되었습니다.' })
   } catch (err) {
      await t.rollback()
      console.error(err)
      res.status(500).json({ message: '서버 오류', error: err })
   }
})

module.exports = router
