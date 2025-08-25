// routes/content.js — finalized with ContentImage upload
const express = require('express')
const { Op } = require('sequelize')
const { Content, User, ContentImage } = require('../models') // ★ ContentImage 추가
const { isAdmin, verifyToken } = require('./middlewares')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const router = express.Router()

// -------- uploads 디렉토리 절대 경로 통일 --------
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
try {
   if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
} catch (e) {
   console.error('[content] uploads 디렉토리 생성 실패:', e)
}

const storage = multer.diskStorage({
   destination(req, file, cb) {
      cb(null, UPLOAD_DIR)
   },
   filename(req, file, cb) {
      try {
         const decoded = decodeURIComponent(file.originalname)
         const ext = path.extname(decoded)
         const basename = path.basename(decoded, ext)
         // 파일명 ASCII 슬러그화(선택) — 한글/공백 안전
         const safeBase = basename.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]+/g, '') || 'upload'
         cb(null, `${safeBase}-${Date.now()}${ext}`)
      } catch {
         const ext = path.extname(file.originalname || '')
         cb(null, `upload-${Date.now()}${ext}`)
      }
   },
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

// 유틸: BASE URL 계산 (환경변수 없으면 요청정보 사용)
function getBaseUrl(req) {
   if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, '')
   const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http'
   const host = req.get('host')
   return `${proto}://${host}`
}

// 공통 include (작성자 조인) — 모델에 alias('Author')를 선언하지 않았다면 as 제거하세요.
const AUTHOR_INCLUDE = {
   model: User,
   // as: 'Author', // ← 모델에서 Content.belongsTo(User, { as:'Author', ... })를 썼을 때만 사용
   attributes: ['id', 'userId', 'name', 'email', 'role'],
   required: false,
}

// 공통 include (이미지 조인) — as 사용 안 함
const IMAGES_INCLUDE = {
   model: ContentImage,
   attributes: ['id', 'oriImgName', 'imgUrl', 'repImgYn', 'createdAt'],
   required: false,
}

// [GET] /contents?page=1&size=10&tag=GUIDE&q=키워드
router.get('/', async (req, res, next) => {
   try {
      const pageRaw = parseInt(`${req.query.page || 1}`, 10)
      const sizeRaw = parseInt(`${req.query.size || 10}`, 10)
      const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1
      const size = Number.isFinite(sizeRaw) ? Math.min(Math.max(sizeRaw, 1), 50) : 10

      const where = { status: 'published' }

      const tag = (req.query.tag || '').trim()
      if (tag) where.tag = tag

      const q = (req.query.q || '').trim()
      if (q) {
         where[Op.or] = [{ title: { [Op.like]: `%${q}%` } }, { summary: { [Op.like]: `%${q}%` } }]
      }

      const offset = (page - 1) * size
      const { rows, count } = await Content.findAndCountAll({
         where,
         include: [AUTHOR_INCLUDE, IMAGES_INCLUDE],
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
         page,
         size,
         total: count,
         hasMore: page * size < count,
      })
   } catch (err) {
      next(err)
   }
})

// [GET] /contents/:id (pk 기반)
router.get('/:id', async (req, res, next) => {
   try {
      const row = await Content.findByPk(req.params.id, {
         include: [AUTHOR_INCLUDE, IMAGES_INCLUDE],
      })
      if (!row || row.status !== 'published') return res.status(404).json({ message: 'Not found' })
      res.json(row)
   } catch (err) {
      next(err)
   }
})

// [GET] /contents/slug/:slug (slug 기반 단건)
router.get('/slug/:slug', async (req, res, next) => {
   try {
      const slug = `${req.params.slug}`
      const row = await Content.findOne({
         where: { slug, status: 'published' },
         include: [AUTHOR_INCLUDE, IMAGES_INCLUDE],
      })
      if (!row) return res.status(404).json({ message: 'Not found' })
      res.json(row)
   } catch (err) {
      next(err)
   }
})

// [POST] /contents (관리자) — 작성자 자동 주입
router.post('/', verifyToken, isAdmin, async (req, res, next) => {
   try {
      const payload = req.body || {}

      const status = payload.status === 'draft' ? 'draft' : 'published'
      const publishedAt = status === 'published' ? payload.publishedAt || new Date() : null

      const authorId = Number.isFinite(+payload.authorId) ? +payload.authorId : req.user?.id ?? null
      const author = (payload.author && `${payload.author}`.trim()) || req.user?.name || null

      const row = await Content.create({
         ...payload,
         authorId,
         author,
         status,
         publishedAt,
      })

      res.status(201).json(row)
   } catch (err) {
      next(err)
   }
})

// [PUT] /contents/:id (관리자)
router.put('/:id', verifyToken, isAdmin, async (req, res, next) => {
   try {
      const row = await Content.findByPk(req.params.id)
      if (!row) return res.status(404).json({ message: 'Not found' })

      const payload = req.body || {}
      const status = payload.status === 'draft' ? 'draft' : payload.status === 'published' ? 'published' : row.status
      const publishedAt = status === 'published' ? payload.publishedAt || row.publishedAt || new Date() : null

      const authorId = payload.authorId !== undefined ? (Number.isFinite(+payload.authorId) ? +payload.authorId : null) : row.authorId ?? req.user?.id ?? null

      const author = (payload.author && `${payload.author}`.trim()) || row.author || req.user?.name || null

      await row.update({ ...payload, authorId, author, status, publishedAt })
      res.json(row)
   } catch (err) {
      next(err)
   }
})

// [DELETE] /contents/:id (관리자)
router.delete('/:id', verifyToken, isAdmin, async (req, res, next) => {
   try {
      const row = await Content.findByPk(req.params.id)
      if (!row) return res.status(404).json({ message: 'Not found' })
      await row.destroy()
      res.json({ ok: true })
   } catch (err) {
      next(err)
   }
})

/**
 * [POST] /contents/:id/images  (관리자)
 * - 본문과 별도로 이미지 등록 (contentImages 테이블에 레코드 생성)
 * - Body: multipart/form-data (field name: image), rep(optional 'Y'|'N')
 */
router.post('/:id/images', verifyToken, isAdmin, upload.single('image'), async (req, res, next) => {
   try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

      const contentId = +req.params.id
      const base = getBaseUrl(req)
      const url = `${base}/uploads/${req.file.filename}` // 인코딩 X

      // 존재 확인(선택)
      const content = await Content.findByPk(contentId)
      if (!content) return res.status(404).json({ message: 'Content not found' })

      // 대표 지정이 'Y'로 오면 기존 대표 초기화(선택 로직)
      if (req.body.rep === 'Y') {
         await ContentImage.update({ repImgYn: 'N' }, { where: { contentId } })
      }

      const img = await ContentImage.create({
         contentId,
         oriImgName: req.file.originalname,
         imgUrl: url,
         repImgYn: req.body.rep === 'Y' ? 'Y' : 'N',
      })

      res.status(201).json(img)
   } catch (err) {
      next(err)
   }
})

/**
 * [DELETE] /contents/:id/images/:imageId  (관리자)
 */
router.delete('/:id/images/:imageId', verifyToken, isAdmin, async (req, res, next) => {
   try {
      const { id, imageId } = req.params
      const img = await ContentImage.findOne({ where: { id: imageId, contentId: id } })
      if (!img) return res.status(404).json({ message: 'Image not found' })
      await img.destroy()
      res.json({ ok: true })
   } catch (err) {
      next(err)
   }
})

// [POST] /contents/images — 단독 이미지 업로드(경로만 발급, 콘텐츠 미연결)
router.post('/images', verifyToken, isAdmin, upload.single('image'), (req, res, next) => {
   try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
      const base = getBaseUrl(req)
      const url = `${base}/uploads/${req.file.filename}` // 인코딩 X
      res.status(201).json({ url })
   } catch (err) {
      next(err)
   }
})

module.exports = router
