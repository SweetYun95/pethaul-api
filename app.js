// pethaul-api/app.js — add static fallback & trust proxy (optional)
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const session = require('express-session')
const passport = require('passport')
require('dotenv').config()
const cors = require('cors')
const fs = require('fs')

// 라우터 및 기타 모듈 불러오기
const indexRouter = require('./routes/index')
const authRouter = require('./routes/auth')
const itemRouter = require('./routes/item')
const orderRouter = require('./routes/order')
const tokenRouter = require('./routes/token')
const reviewRouter = require('./routes/review')
const cartRouter = require('./routes/cart')
const petRouter = require('./routes/pet')
const likeRouter = require('./routes/like')
const contentRouter = require('./routes/content') // ★ 추가
const { sequelize } = require('./models')
const passportConfig = require('./passport')

const app = express()
passportConfig()

// (선택) 프록시 환경에서 올바른 프로토콜/호스트 계산을 위해
// Nginx/Render/Heroku 등 프록시 뒤라면 1 이상으로
// app.set('trust proxy', 1)

// 👉 포트: .env에 PORT 없으면 기본 8002
app.set('port', process.env.PORT || 8002)

// 시퀄라이즈를 사용한 DB연결
sequelize
   .sync({ force: false })
   .then(() => {
      console.log(' 🛠 데이터베이스 연결 성공')
   })
   .catch((err) => {
      console.error(err)
   })

// 미들웨어 설정
app.use(
   cors({
      origin: process.env.FRONTEND_APP_URL, // 프론트엔드 URL
      credentials: true, // 쿠키, 세션 인증 정보 전송 허용
   })
)
app.use(morgan('dev'))

// 업로드 파일은 /uploads 경로로 접근 (절대경로 보장)
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
app.use('/uploads', express.static(uploadsDir))

// (선택) 레거시 파일명 폴백: /hero_*.jpg → /uploads/hero_*.jpg
app.get(/^\/(?:[^\/]+\.(?:png|jpe?g|webp|gif|svg))$/i, (req, res, next) => {
   const filename = req.path.slice(1)
   const abs = path.join(uploadsDir, filename)
   fs.access(abs, fs.constants.R_OK, (err) => {
      if (err) return next()
      res.sendFile(abs)
   })
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser(process.env.COOKIE_SECRET))

// 세션 설정
const sessionMiddleware = session({
   resave: false,
   saveUninitialized: false,
   secret: process.env.COOKIE_SECRET,
   cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, // 1일
   },
})
app.use(sessionMiddleware)

// Passport 초기화, 세션 연동
app.use(passport.initialize())
app.use(passport.session())

// 라우터 등록
app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/item', itemRouter)
app.use('/order', orderRouter)
app.use('/token', tokenRouter)
app.use('/review', reviewRouter)
app.use('/cart', cartRouter)
app.use('/pets', petRouter)
app.use('/like', likeRouter)
app.use('/contents', contentRouter) // ★ contents API 등록

// 잘못된 라우터 경로 처리
app.use((req, res, next) => {
   const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`)
   error.status = 404
   next(error)
})

// 에러 미들웨어
app.use((err, req, res, next) => {
   const statusCode = err.status || 500
   const errorMessage = err.message || '서버 내부 오류'

   if (process.env.NODE_ENV === 'development') {
      console.log(err)
   }

   res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: err,
   })
})

app.listen(app.get('port'), () => {
   console.log(app.get('port'), '번 포트에서 대기중')
})
