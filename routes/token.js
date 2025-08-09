const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { Domain } = require('../models')
const { isLoggedIn, isAdmin, verifyToken } = require('./middlewares')

// 토큰 발급
router.get('/get', isLoggedIn, async (req, res, next) => {
   try {
      // console.log('👩🏻[token.js] req.user:', req.user)
      const origin = req.get('origin') || req.headers.host
      const token = jwt.sign(
         {
            id: req.user.id,
            email: req.user.email,
         },
         process.env.JWT_SECRET,
         {
            expiresIn: '365d',
            issuer: 'shopmaxadmin',
         }
      )

      // console.log('💾[token.js] /get token:', token)

      await Domain.create({
         userId: req.user.id,
         host: origin,
         clientToken: token,
      })

      res.json({
         success: true,
         message: '토큰이 발급되었습니다.',
         token,
      })
   } catch (error) {
      // console.error('🔥 [token.js] Domain.create 오류 원본:', error)
      error.status = 500
      error.message = '토큰 발급 중 오류가 발생했습니다.'
      return next(error)
   }
})

//DB에 저장된 토큰 조회
router.get('/read', isAdmin, async (req, res, next) => {
   try {
      const origin = req.get('origin')
      const userId = req.user.id

      const domainData = await Domain.findOne({
         where: { userId, host: origin },
      })

      if (!domainData) {
         const error = new Error('토큰이 존재하지 않습니다.')
         error.status = 404
         return next(error)
      }

      res.json({
         success: true,
         message: '토큰을 성공적으로 불러왔습니다.',
         token: domainData.clientToken,
      })
   } catch (error) {
      error.status = 500
      error.message = '토큰을 불러오는 중 오류가 발생했습니다.'
      return next(error)
   }
})

//토큰 재발급
router.get('/refresh', isLoggedIn, async (req, res, next) => {
   try {
      const origin = req.get('origin')
      const domainData = await Domain.findOne({ where: { userId: req.user.id, host: origin } })
      if (!domainData) {
         const error = new Error('토큰이 존재하지 않습니다.')
         error.status = 404
         return next(error)
      }

      const newToken = jwt.sign(
         {
            id: req.user.id,
            email: req.user.email,
            nonce: Math.random().toString(36).substring(2), // // 토큰 중복 생성을 방지하기 위한 랜덤 문자열
         },
         process.env.JWT_SECRET,
         {
            expiresIn: '365d',
            issuer: 'shopmaxadmin',
         }
      )

      console.log('✅ 기존 토큰:', domainData.clientToken)
      console.log('✅ 새 토큰:', newToken)

      domainData.clientToken = newToken
      await domainData.save()

      res.json({
         success: true,
         message: '토큰이 성공적으로 재발급되었습니다.',
         token: newToken,
      })
   } catch (error) {
      error.status = 500
      error.message = '토큰을 재발급하는 중 오류가 발생했습니다.'
      return next(error)
   }
})

// 토큰 유효성 확인용
/* 
프론트에서 발급/재발급 버튼 구현할 때 필요할 것 같아서 작성합니다. 필요없을 경우 이 부분 삭제
*/
router.get('/checkTokenStatus', verifyToken, async (req, res, next) => {
   try {
      res.json({
         success: true,
         message: '유효한 토큰입니다.',
      })
   } catch (error) {
      error.status = 500
      error.message = '토큰 유효성 검사 중 오류가 발생했습니다.'
      return next(error)
   }
})

module.exports = router
