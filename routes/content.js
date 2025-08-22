// routes/content.js
const express = require('express')
const { Op } = require('sequelize')
const { Content } = require('../models')
const { isAdmin, verifyToken } = require('./middlewares')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const router = express.Router()

try { fs.readdirSync('uploads') } catch (e) { fs.mkdirSync('uploads') }

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) { cb(null, 'uploads/') },
    filename(req, file, cb) {
      const decoded = decodeURIComponent(file.originalname)
      const ext = path.extname(decoded)
      const basename = path.basename(decoded, ext)
      cb(null, `${basename}-${Date.now()}${ext}`)
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
})

// [GET] /contents?page=1&size=10&tag=GUIDE&q=키워드
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10))
    const size = Math.max(1, Math.min(50, parseInt(req.query.size || '10', 10)))
    const where = { status: 'published' }

    if (req.query.tag) where.tag = req.query.tag
    if (req.query.q?.trim()) {
      const q = req.query.q.trim()
      where[Op.or] = [
        { title:   { [Op.like]: `%${q}%` } },
        { summary: { [Op.like]: `%${q}%` } },
      ]
    }

    const offset = (page - 1) * size
    const { rows, count } = await Content.findAndCountAll({
      where,
      order: [
        ['isFeatured', 'DESC'],
        ['publishedAt', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      limit: size,
      offset,
    })

    res.json({
      list: rows,
      page, size, total: count,
      hasMore: page * size < count,
    })
  } catch (err) { next(err) }
})

// [GET] /contents/:id
router.get('/:id', async (req, res, next) => {
  try {
    const row = await Content.findByPk(req.params.id)
    if (!row || row.status !== 'published') return res.status(404).json({ message: 'Not found' })
    res.json(row)
  } catch (err) { next(err) }
})

// [POST] /contents (관리자)
router.post('/', verifyToken, isAdmin, async (req, res, next) => {
  try {
    const payload = req.body
    const row = await Content.create({
      ...payload,
      publishedAt: payload.status === 'published'
        ? (payload.publishedAt || new Date())
        : null,
    })
    res.status(201).json(row)
  } catch (err) { next(err) }
})

// [PUT] /contents/:id (관리자)
router.put('/:id', verifyToken, isAdmin, async (req, res, next) => {
  try {
    const row = await Content.findByPk(req.params.id)
    if (!row) return res.status(404).json({ message: 'Not found' })
    const payload = req.body
    await row.update({
      ...payload,
      publishedAt: payload.status === 'published'
        ? (payload.publishedAt || row.publishedAt || new Date())
        : null,
    })
    res.json(row)
  } catch (err) { next(err) }
})

// [DELETE] /contents/:id (관리자)
router.delete('/:id', verifyToken, isAdmin, async (req, res, next) => {
  try {
    const row = await Content.findByPk(req.params.id)
    if (!row) return res.status(404).json({ message: 'Not found' })
    await row.destroy()
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// [POST] /contents/images (관리자)
router.post('/images', verifyToken, isAdmin, upload.single('image'), (req, res) => {
  const base = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8002}`
  const url = `${base}/uploads/${req.file.filename}`
  res.status(201).json({ url })
})

module.exports = router
