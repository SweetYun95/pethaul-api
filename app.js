const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const session = require('express-session')
const passport = require('passport')
require('dotenv').config()
const cors = require('cors')
// const { swaggerUi, swaggerSpec } = require('./swagger')
// const http = require('http')
// const socketIO = require('./socket')

// 라우터 및 기타 모듈 불러오기
const indexRouter = require('./routes/index')
const authRouter = require('./routes/auth')
const itemRouter = require('./routes/item')
const orderRouter = require('./routes/order')
const tokenRouter = require('./routes/token')
const reviewRouter = require('./routes/review')
const cartRouter = require('./routes/cart')

const { sequelize } = require('./models')
const passportConfig = require('./passport')

const app = express()
passportConfig()
app.set('port', process.env.PORT || 8002)

// 시퀄라이즈를 사용한 DB연결
sequelize
   .sync({ force: false })
   .then(() => {
      console.log(' 🛠 데이터베이스 연결 성공')
   })
   .catch((err) => {
      console.error(err) //연결 실패시 오류 출력
   })

//미들웨어 설정
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)) // http://localhost:8000/api-docs
app.use(
   cors({
      origin: process.env.FRONTEND_APP_URL,
      credentials: true,
   })
)
app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'uploads')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser(process.env.COOKIE_SECRET))

//세션 설정
const sessionMiddleware = session({
   resave: false,
   saveUninitialized: true,
   secret: process.env.COOKIE_SECRET,
   cookie: {
      httpOnly: true,
      secure: false,
   },
})
app.use(sessionMiddleware)

//Passport 초기화, 세션 연동
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

// HTTP 서버 생성
// const server = http.createServer(app)

// Socket.IO 초기화 및 서버와 연결, 세션을 사용하기 위해 sessionMiddleware 전송
// socketIO(server, sessionMiddleware)

// 잘못된 라우터 경로 처리
app.use((req, res, next) => {
   const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`)
   error.status = 404
   next(error)
})

// 에러 미들웨어(미들웨어 실행 중 발생하는 에러를 처리함)
app.use((err, req, res, next) => {
   const statusCode = err.status || 500
   const errorMessage = err.message || '서버 내부 오류'

   //개발 중 서버 콘솔에서 상세한 에러 확인 용도
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

// server.listen(app.get('port'), () => {
//    console.log(app.get('port'), '번 포트에서 대기중')
// })
