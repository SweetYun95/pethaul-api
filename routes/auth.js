// routes/auth.js
const express = require('express')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const passport = require('passport')
const { User } = require('../models')
const { isLoggedIn, isNotLoggedIn } = require('./middlewares')

const router = express.Router()

// 회원가입
router.post('/join', isNotLoggedIn, async (req, res, next) => {
   const { email, password, name, userId, address, gender, phoneNumber } = req.body

   try {
      // 이메일 중복 확인
      const exUser = await User.findOne({ where: { email } })
      if (exUser) {
         const err = new Error('이미 가입된 이메일입니다.')
         err.status = 409
         return next(err)
      }

      // 전화번호가 온 경우에만 중복 확인 (null 허용)
      if (phoneNumber) {
         const exPhone = await User.findOne({ where: { phoneNumber } })
         if (exPhone) {
            const err = new Error('이미 사용 중인 전화번호입니다.')
            err.status = 409
            return next(err)
         }
      }

      // 비밀번호 암호화 (구글 등 소셜계정은 password가 없을 수 있음)
      const hashed = password ? await bcrypt.hash(password, 12) : null

      await User.create({
         userId,
         email,
         password: hashed,
         name,
         address,
         gender,
         phoneNumber,
      })

      return res.status(201).json({ success: true, message: '회원가입 성공' })
   } catch (err) {
      return next(err)
   }
})

// 아이디 중복 확인
router.post('/check-username', async (req, res, next) => {
   const { userId } = req.body
   try {
      const existingUser = await User.findOne({ where: { userId } })
      if (existingUser) {
         const err = new Error('이미 사용 중인 아이디입니다.')
         err.status = 409
         return next(err)
      }
      return res.status(200).json({ success: true, message: '사용 가능한 아이디입니다.' })
   } catch (err) {
      return next(err)
   }
})

// 로그인
router.post('/login', isNotLoggedIn, (req, res, next) => {
   passport.authenticate('local', (authError, user, info) => {
      if (authError) return next(authError)
      if (!user) {
         const err = new Error(info?.message || '인증 실패')
         err.status = 401
         return next(err)
      }
     
      req.login(user, async (loginError) => {
         if (loginError) {
            console.error(loginError)
            return next(loginError)
         }


         //임시 비밀번호 만료 확인
         if (user.tempPasswordExpiresAt && new Date() > user.tempPasswordExpiresAt) {
            // DB에서 임시 비밀번호 만료 처리
            await User.update(
               {
                  tempPasswordExpiresAt: null,
                  password: null,
               },
               { where: { id: user.id } }
            )

            return res.status(401).json({
               message: '임시 비밀번호가 만료되었습니다. 다시 비밀번호 찾기를 진행해주세요.',
            })
         }

         return res.status(200).json({
            success: true,
            message: '로그인 성공',
            user: {
               id: user.id,
               userId: user.userId,
               email: user.email,
               name: user.name,
               role: user.role,
               provider: user.provider,
<<<<<<< HEAD
               phoneNumber: user.phoneNumber, // ✅ 추가
               address: user.address,
=======
               phoneNumber: user.phoneNumber,
>>>>>>> 352483f0bd52701d7b071f8b006bf5df2ee859f3
            },
         })
      })
   })(req, res, next)
})

// 로그아웃
router.post('/logout', isLoggedIn, (req, res, next) => {
   req.logout((err) => {
      if (err) return next(err)

      req.session.destroy(() => {
         res.clearCookie('connect.sid')
         return res.status(200).json({ success: true, message: '로그아웃 성공' })
      })
   })
})

// 로그인 상태 확인
router.get('/check', (req, res) => {
   if (req.isAuthenticated()) {
      return res.status(200).json({
         isAuthenticated: true,
         user: {
            id: req.user.id,
            userId: req.user.userId,
            email: req.user.email,
            name: req.user.name,
            role: req.user.role,
            provider: req.user.provider,
<<<<<<< HEAD
            phoneNumber: req.user.phoneNumber, // ✅ 추가
            address: req.user.address,
=======
            phoneNumber: req.user.phoneNumber,
>>>>>>> 352483f0bd52701d7b071f8b006bf5df2ee859f3
         },
      })
   }
   return res.status(200).json({ isAuthenticated: false })
})

// ✅ 구글 로그인 시작
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

// ✅ 구글 로그인 콜백 처리
router.get(
   '/google/callback',
   passport.authenticate('google', {
      failureRedirect: '/login',
      session: true,
   }),
   (req, res) => {
      // 로그인 성공 시 프론트로 리다이렉트
      return res.redirect(`${process.env.CLIENT_URL}/google-success`)
   }
)

// ✅ 구글 로그인 상태 체크
router.get('/googlecheck', (req, res) => {
   if (req.isAuthenticated() && req.user.provider === 'google') {
      return res.status(200).json({
         googleAuthenticated: true,
         user: {
            id: req.user.id,
            userId: req.user.userId,
            email: req.user.email,
            name: req.user.name,
            role: req.user.role,
            provider: req.user.provider,
            phoneNumber: req.user.phoneNumber,
         },
      })
   }
   return res.status(200).json({ googleAuthenticated: false })
})

// 핸드폰 번호로 id 찾기
router.post('/findid', isNotLoggedIn, async (req, res, next) => {
   try {
      const { phoneNumber } = req.body
      console.log('🎀phoneNumber:', phoneNumber)
      const users = await User.findAll({ where: { phoneNumber } })

      if (!users.length) {
         return res.status(404).json({
            message: '입력하신 정보와 일치하는 회원이 존재하지 않습니다.',
         })
      }

      res.status(200).json({
         message: 'ID 조회에 성공했습니다.',
         ids: users.map((user) => user.userId),
      })
   } catch (error) {
      next(error)
   }
})

// 비밀번호 분실 시 임시비밀번호 발급
router.post('/updatepw', isNotLoggedIn, async (req, res, next) => {
   try {
      const { userId, phoneNumber } = req.body
      const user = await User.findOne({ where: { userId, phoneNumber } })
      if (!user) {
         return res.status(404).json({ message: '입력하신 정보와 일치하는 회원이 존재하지 않습니다.' })
      }

      //임시 비밀번호 생성 및 해싱
      const tempPassword = crypto.randomBytes(6).toString('hex')
      const hash = await bcrypt.hash(tempPassword, 10)

      await user.update({
         password: hash,
         tempPasswordExpiresAt: new Date(Date.now() + 30 * 60 * 1000), // 유효시간 30분
      })
      res.status(200).json({
         message: '임시 비밀번호가 발급되었습니다.',
         tempPassword,
      })
   } catch (error) {
      next(error)
   }
})

//회원 정보 수정
router.put('/', isLoggedIn, async (req, res, next) => {
   try {
      const { userId, password, name, email, phoneNumber, address, newPassword } = req.body
      const user = await User.findByPk(req.user.id)
      if (!user) {
         return res.status(404).json({ message: '회원 정보를 찾을 수 없습니다.' })
      }

      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
         return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' })
      }

      user.userId = userId
      user.name = name
      user.email = email
      if (phoneNumber) user.phoneNumber = phoneNumber
      if (address) user.address = address
      if (newPassword) user.password = await bcrypt.hash(newPassword, 12)

      await user.save()
      res.status(200).json({
         message: '회원 정보를 성공적으로 수정했습니다.',
         user: {
            id: req.user.id,
            userId: user.userId,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            address: user.address,
         },
      })
   } catch (error) {
      next(error)
   }
})
module.exports = router
