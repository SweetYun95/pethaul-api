const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const { User } = require('../models')
const { isLoggedIn, isNotLoggedIn } = require('./middlewares')

const router = express.Router()

// 회원가입
router.post('/join', isNotLoggedIn, async (req, res) => {
   const { email, password, name, userId, address, gender } = req.body

   try {
      const exUser = await User.findOne({ where: { email } })
      if (exUser) {
         return res.status(409).json({ message: '이미 가입된 이메일입니다.' })
      }

      const hash = await bcrypt.hash(password, 12)
      await User.create({
         userId,
         email,
         password: hash,
         name,
         address,
         gender,
      })

      res.status(201).json({ message: '회원가입 성공' })
   } catch (error) {
      console.error('회원가입 중 에러:', error)
      res.status(500).json({ message: '서버 오류', error })
   }
})

// 아이디 중복 확인
router.post('/check-username', async (req, res) => {
   const { userId } = req.body

   try {
      const existingUser = await User.findOne({ where: { userId } })
      if (existingUser) {
         return res.status(409).json({ message: '이미 사용 중인 아이디입니다.' })
      }
      return res.status(200).json({ message: '사용 가능한 아이디입니다.' })
   } catch (error) {
      console.error('아이디 중복 확인 중 에러:', error)
      return res.status(500).json({ message: '서버 오류' })
   }
})

// 로그인
router.post('/login', isNotLoggedIn, (req, res, next) => {
   passport.authenticate('local', (authError, user, info) => {
      if (authError) {
         console.error(authError)
         return next(authError)
      }
      if (!user) {
         return res.status(401).json({ message: info.message })
      }

      req.login(user, (loginError) => {
         if (loginError) {
            console.error(loginError)
            return next(loginError)
         }

         return res.status(200).json({
            message: '로그인 성공',
            user: {
               id: user.id,
               userId: user.userId,
               email: user.email,
               name: user.name,
               role: user.role,
            },
         })
      })
   })(req, res, next)
})

// 로그아웃
router.post('/logout', isLoggedIn, (req, res) => {
   req.logout((err) => {
      if (err) {
         console.error(err)
         return res.status(500).json({ message: '로그아웃 중 오류 발생' })
      }

      req.session.destroy(() => {
         res.clearCookie('connect.sid')
         res.status(200).json({ message: '로그아웃 성공' })
      })
   })
})

// 로그인 상태 확인
router.get('/check', (req, res) => {
   if (req.isAuthenticated()) {
      res.status(200).json({
         isAuthenticated: true,
         user: {
            id: req.user.id,
            userId: req.user.userId,
            email: req.user.email,
            name: req.user.name,
            role: req.user.role,
         },
      })
   } else {
      res.status(200).json({
         isAuthenticated: false,
      })
   }
})

// ✅ 구글 로그인 시작 (구글 로그인 버튼 클릭 시 실행)
router.get(
   '/google',
   passport.authenticate('google', {
      scope: ['profile', 'email'],
   })
)

// ✅ 구글 로그인 콜백 처리
router.get(
   '/google/callback',
   passport.authenticate('google', {
      failureRedirect: '/login', // 로그인 실패 시 이동할 경로
      session: true, // 세션 사용 여부
   }),
   (req, res) => {
      // 로그인 성공 시 프론트로 리다이렉트
      // 실제 프론트 도메인에 맞게 수정할 것
      res.redirect(`${process.env.CLIENT_URL}/google-success`)
   }
)

module.exports = router
