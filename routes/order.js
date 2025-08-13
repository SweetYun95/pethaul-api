// routes/order.js
const express = require('express')
const { Order, OrderItem, Item, ItemImage, User } = require('../models')
const { isLoggedIn, isAdmin } = require('./middlewares')
const { Op, col, fn } = require('sequelize')

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
               orderPrice: item.price * item.quantity,
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
               attributes: ['id', 'itemNm', 'price'],
               through: { attributes: ['orderPrice', 'count'] },
               include: [
                  {
                     model: ItemImage,
                     attributes: ['id', 'oriImgName', 'imgUrl'],
                     where: { repImgYn: 'Y' },
                     required: false,
                  },
               ],
            },
         ],
      })

      res.status(200).json({
         success: true,
         message: '주문목록 조회 성공',
         orders,
      })
   } catch (err) {
      console.error(err)
      res.status(500).json({ message: '서버 오류', error: err })
   }
})

// 전체 주문 조회(관리자용)

router.get('/all/admin', async (req, res, next) => {
   try {
      const sort = req.query.sort || 'orderDate'
      let orderClause = [['orderDate', 'DESC']]
      let group
      let whereClause = {}

      if (sort === 'salesCount') {
         //전체 판매량순
         orderClause = [[fn('SUM', col('Items->OrderItem.count')), 'DESC']]
         group = ['Items.id']
      } else if (sort === 'orderDate') {
         //최근 주문 많은 순
         orderClause = [[fn('COUNT', col('Items->OrderItem.count')), 'DESC']]
         group = ['Items.id']

         // 최근 1개월 조건
         const oneMonthAgo = new Date()
         oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
         whereClause.orderDate = { [Op.between]: [oneMonthAgo, new Date()] }
      } else if (sort === 'yesterday') {
         //전일자 주문 조회
         const yesterday = new Date()
         yesterday.setDate(yesterday.getDate() - 1)

         const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0))
         const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999))

         whereClause.orderDate = {
            [Op.between]: [startOfYesterday, endOfYesterday],
         }
      }

      const orders = await Order.findAll({
         where: whereClause,
         attributes: [
            'id',
            'orderDate',
            'orderStatus',
            [col('Items->OrderItem.orderPrice'), 'orderPrice'],
            [col('Items->OrderItem.count'), 'count'],
            [col('Items.itemNm'), 'itemNm'],
            [col('Items.price'), 'price'],
            [col('Items.id'), 'itemId'],
            [col('Items->ItemImages.imgUrl'), 'itemImgUrl'],
            [fn('COUNT', fn('DISTINCT', col('Order.id'))), 'orderCount'], // 주문 건수
         ],

         include: [
            {
               model: Item,
               attributes: [],
               through: {
                  attributes: [],
               },
               include: [
                  {
                     model: ItemImage,
                     attributes: [],
                     required: false,
                  },
               ],
            },
         ],
         order: orderClause,
         group: ['Items.id', 'Order.id', 'Order.orderDate', 'Order.orderStatus', 'Items.itemNm', 'Items.price', 'Items->OrderItem.orderPrice', 'Items->OrderItem.count', 'Items->ItemImages.imgUrl'],
      })
      if (!orders.length) {
         return res.status(404).json({ message: '데이터를 찾을 수 없습니다.' })
      }
      res.json({ orders })
   } catch (error) {
      console.error(error)
      res.status(500).json({ message: '서버 오류', error: error })
   }
})

// 회원 조회용 주문데이터(베스트셀러 정렬 등)
router.get('/all/main', async (req, res, next) => {
   try {
      const sort = req.query.sort || 'orderDate'
      let orderClause = [['orderDate', 'DESC']]
      let group
      let whereClause = {}

      if (sort === 'salesCount') {
         //전체 판매량순
         orderClause = [[fn('SUM', col('Items->OrderItem.count')), 'DESC']]
         group = ['Items.id']
      } else if (sort === 'orderDate') {
         //최근 주문 많은 순
         orderClause = [[fn('COUNT', col('Items->OrderItem.count')), 'DESC']]
         group = ['Items.id']

         // 최근 1개월 조건
         const oneMonthAgo = new Date()
         oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
         whereClause.orderDate = { [Op.between]: [oneMonthAgo, new Date()] }
      }

      const orders = await Order.findAll({
         where: whereClause,
         attributes: ['id', 'orderDate', 'orderStatus', [col('Items->OrderItem.orderPrice'), 'orderPrice'], [col('Items->OrderItem.count'), 'count'], [col('Items.itemNm'), 'itemNm'], [col('Items.price'), 'price'], [col('Items.id'), 'itemId'], [col('Items->ItemImages.imgUrl'), 'itemImgUrl']],

         include: [
            {
               model: Item,
               attributes: [],
               through: {
                  attributes: [],
               },
               include: [
                  {
                     model: ItemImage,
                     attributes: [],
                     required: false,
                  },
               ],
            },
         ],
         order: orderClause,
         group: ['Items.id', 'Order.id', 'Order.orderDate', 'Order.orderStatus', 'Items.itemNm', 'Items.price', 'Items->OrderItem.orderPrice', 'Items->OrderItem.count', 'Items->ItemImages.imgUrl'],
      })
      if (!orders.length) {
         return res.status(404).json({ message: '데이터를 찾을 수 없습니다.' })
      }
      res.json({ orders })
   } catch (error) {
      console.error(error)
      res.status(500).json({ message: '서버 오류', error: error })
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

//주문 상태 변경(배송 준비중 등)
router.patch('/:id', async (req, res, next) => {
   try {
      const newStatus = req.query.status

      const order = await Order.findOne({
         where: {
            id: req.params.id,
         },
      })
      if (!order) {
         return res.status(404).json({ message: '주문을 찾을 수 없습니다.' })
      }
      order.orderStatus = newStatus
      await order.save()
      res.json({ message: `주문 상태가 ${req.query.status}로 변경되었습니다.` })
   } catch (error) {
      console.error(error)
      res.status(500).json({ message: '서버 오류', error: error })
   }
})

module.exports = router
