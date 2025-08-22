// routes/content.js — reviewed & patched
// 주요 변경 요약:
// 1) 업로드 경로를 절대경로로 통일 (multer storage ↔ static served path 일치)
// 2) 파일 업로드 시 req.file 미존재 처리 및 응답 형식 강화
// 3) 쿼리 파싱 보강: page/size 안전 파싱, tag/q trim
// 4) 검색 like 안전 처리 (콜레이션이 ci라면 그대로 OK, 필요 시 LOWER 비교로 교체 가능)
// 5) 단건 조회에 slug 지원(선택): GET /contents/slug/:slug
// 6) publishedAt 자동 설정 로직 유지하되 payload.status 검증 추가
// 7) try/catch 에서 next(err) 일관 처리
// 8) 관리자 전용 라우트는 verifyToken → isAdmin 순서 유지

const express = require('express')
const { Op, Sequelize } = require('sequelize')
const { Content } = require('../models')
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
         cb(null, `${basename}-${Date.now()}${ext}`)
      } catch (_) {
         // 파일명이 깨지는 극단 케이스 대비
         const ext = path.extname(file.originalname || '')
         cb(null, `upload-${Date.now()}${ext}`)
      }
   },
})

const upload = multer({
   storage,
   limits: { fileSize: 10 * 1024 * 1024 },
})

// 유틸: BASE URL 계산 (환경변수 없으면 요청정보 사용)
function getBaseUrl(req) {
   if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, '')
   const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http'
   const host = req.get('host')
   return `${proto}://${host}`
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
         // MySQL 기본 콜레이션이 ci(대소문자 구분 없음)라면 LIKE로 충분
         where[Op.or] = [{ title: { [Op.like]: `%${q}%` } }, { summary: { [Op.like]: `%${q}%` } }]
         // Postgres 등 사용 시 iLike 고려: { [Op.iLike]: `%${q}%` }
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
router.get('/:id(\\d+)', async (req, res, next) => {
   try {
      const row = await Content.findByPk(req.params.id)
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
      const row = await Content.findOne({ where: { slug, status: 'published' } })
      if (!row) return res.status(404).json({ message: 'Not found' })
      res.json(row)
   } catch (err) {
      next(err)
   }
})

// [POST] /contents (관리자)
router.post('/', verifyToken, isAdmin, async (req, res, next) => {
   try {
      const payload = req.body || {}

      // status 값 검증
      const status = payload.status === 'draft' ? 'draft' : 'published'
      const publishedAt = status === 'published' ? payload.publishedAt || new Date() : null

      const row = await Content.create({
         ...payload,
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

      await row.update({
         ...payload,
         status,
         publishedAt,
      })

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

// [POST] /contents/images (관리자)
router.post('/images', verifyToken, isAdmin, upload.single('image'), (req, res, next) => {
   try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
      const base = getBaseUrl(req)
      const url = `${base}/uploads/${encodeURIComponent(req.file.filename)}`
      res.status(201).json({ url })
   } catch (err) {
      next(err)
   }
})

module.exports = router
