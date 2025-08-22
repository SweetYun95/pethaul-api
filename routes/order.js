// routes/order.js
const express = require('express')
const { Order, OrderItem, Item, ItemImage } = require('../models')
const { isLoggedIn } = require('./middlewares')
const { Op, col, fn } = require('sequelize')

const router = express.Router()

/**
 * 주문 생성
 */
router.post('/', isLoggedIn, async (req, res, next) => {
   const t = await Order.sequelize.transaction()
   try {
      const { items } = req.body // [{ itemId, price, quantity }]
      if (!items || items.length === 0) {
         const error = new Error('주문할 상품이 없습니다.')
         error.status = 400
         await t.rollback()
         return next(error)
      }

      // 재고 체크
      for (const it of items) {
         const product = await Item.findByPk(it.itemId, { transaction: t })
         if (!product) {
            await t.rollback()
            const error = new Error(`상품 ID ${it.itemId}을 찾을 수 없습니다.`)
            error.status = 404
            return next(error)
         }
         if (product.stockNumber < it.quantity) {
            await t.rollback()
            const error = new Error(`${product.itemNm} 상품 재고가 부족합니다.`)
            error.status = 400
            return next(error)
         }
      }

      // 주문 생성
      const order = await Order.create({ userId: req.user.id, orderDate: new Date(), orderStatus: 'ORDER' }, { transaction: t })

      // 주문상품 생성 + 재고 차감
      for (const it of items) {
         await OrderItem.create({ orderId: order.id, itemId: it.itemId, orderPrice: it.price * it.quantity, count: it.quantity }, { transaction: t })

         const product = await Item.findByPk(it.itemId, { transaction: t })
         product.stockNumber -= it.quantity
         await product.save({ transaction: t })
      }

      await t.commit()
      return res.status(201).json({ success: true, message: '주문이 완료되었습니다.', orderId: order.id })
   } catch (err) {
      await t.rollback()
      err.status = err.status || 500
      err.message = err.message || '주문 생성 실패'
      return next(err)
   }
})

/**
 * 주문 목록 조회 (내 주문)
 */
router.get('/', isLoggedIn, async (req, res, next) => {
   try {
      const page = parseInt(req.query.page, 10) || 1
      const limit = parseInt(req.query.limit, 10) || 5
      const offset = (page - 1) * limit

      const count = await Order.count({
         where: {
            userId: req.user.id,
         },
      })

      const orders = await Order.findAll({
         where: { userId: req.user.id },
         limit,
         offset,
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

      return res.status(200).json({
         success: true,
         message: '주문목록 조회 성공',
         orders,
         pagination: {
            totalOrders: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            limit,
         },
      })
   } catch (err) {
      err.status = err.status || 500
      err.message = '주문목록 조회 실패'
      return next(err)
   }
})

/**
 * 전체 주문 조회(관리자용)
 */
router.get('/all/admin', async (req, res, next) => {
   try {
      const sort = req.query.sort || 'orderDate'
      let orderClause = [['orderDate', 'DESC']]
      let group
      let whereClause = {}

      if (sort === 'salesCount') {
         // 전체 판매량순
         orderClause = [[fn('SUM', col('Items->OrderItem.count')), 'DESC']]
         group = ['Items.id']
      } else if (sort === 'orderDate') {
         // 최근 주문 많은 순 (최근 1개월)
         orderClause = [[fn('COUNT', col('Items->OrderItem.count')), 'DESC']]
         group = ['Items.id']
         const oneMonthAgo = new Date()
         oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
         whereClause.orderDate = { [Op.between]: [oneMonthAgo, new Date()] }
      } else if (sort === 'yesterday') {
         // 전일자 주문 조회
         const yesterday = new Date()
         yesterday.setDate(yesterday.getDate() - 1)
         const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0))
         const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999))
         whereClause.orderDate = { [Op.between]: [startOfYesterday, endOfYesterday] }
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
            [fn('COUNT', fn('DISTINCT', col('Order.id'))), 'orderCount'],
         ],
         include: [
            {
               model: Item,
               attributes: [],
               through: { attributes: [] },
               include: [{ model: ItemImage, attributes: [], required: false }],
            },
         ],
         order: orderClause,
         group: ['Items.id', 'Order.id', 'Order.orderDate', 'Order.orderStatus', 'Items.itemNm', 'Items.price', 'Items->OrderItem.orderPrice', 'Items->OrderItem.count', 'Items->ItemImages.imgUrl'],
      })

      if (!orders.length) {
         const error = new Error('데이터를 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      return res.json({ success: true, orders })
   } catch (err) {
      err.status = err.status || 500
      err.message = '관리자 주문 조회 실패'
      return next(err)
   }
})

/**
 * 주문 상세 조회 (내 주문)
 */
router.get('/:id', isLoggedIn, async (req, res, next) => {
   try {
      const order = await Order.findOne({
         where: { id: req.params.id, userId: req.user.id },
         include: [{ model: Item, through: { attributes: ['orderPrice', 'count'] } }],
      })

      if (!order) {
         const error = new Error('주문을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      return res.json({ success: true, order })
   } catch (err) {
      err.status = err.status || 500
      err.message = '주문 상세 조회 실패'
      return next(err)
   }
})

/**
 * 주문 취소 (내 주문)
 */
router.patch('/:id/cancel', isLoggedIn, async (req, res, next) => {
   const t = await Order.sequelize.transaction()
   try {
      const order = await Order.findOne({
         where: { id: req.params.id, userId: req.user.id },
         include: [{ model: Item, through: { attributes: ['count'] } }],
         transaction: t,
      })

      if (!order) {
         await t.rollback()
         const error = new Error('주문을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      // 재고 복구
      for (const it of order.Items) {
         const product = await Item.findByPk(it.id, { transaction: t })
         product.stockNumber += it.OrderItem.count
         await product.save({ transaction: t })
      }

      order.orderStatus = 'CANCEL'
      await order.save({ transaction: t })

      await t.commit()
      return res.json({ success: true, message: '주문이 취소되었습니다.' })
   } catch (err) {
      await t.rollback()
      err.status = err.status || 500
      err.message = '주문 취소 실패'
      return next(err)
   }
})

/**
 * 주문 상태 변경 (관리자/시스템 용도로 가정)
 * - 쿼리: ?status=SHIPPING 등
 */
router.patch('/:id', async (req, res, next) => {
   try {
      const newStatus = req.query.status
      if (!newStatus) {
         const error = new Error('변경할 상태(status)가 필요합니다.')
         error.status = 400
         return next(error)
      }

      const order = await Order.findOne({ where: { id: req.params.id } })
      if (!order) {
         const error = new Error('주문을 찾을 수 없습니다.')
         error.status = 404
         return next(error)
      }

      order.orderStatus = newStatus
      await order.save()

      return res.json({ success: true, message: `주문 상태가 ${newStatus}로 변경되었습니다.` })
   } catch (err) {
      err.status = err.status || 500
      err.message = '주문 상태 변경 실패'
      return next(err)
   }
})

module.exports = router
