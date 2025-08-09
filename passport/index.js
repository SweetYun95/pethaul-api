const passport = require('passport')
const local = require('./localStrategy')
const google = require('./googleStrategy')
const User = require('../models/user')

module.exports = () => {
   // 로그인 성공 시 유저 정보를 세션에 저장
   passport.serializeUser((user, done) => {
      done(null, user.id) // user.id만 저장 (용량 절약)
   })

   // 매 요청 시 세션에 저장된 id를 이용해 유저 정보 복원
   passport.deserializeUser((id, done) => {
      User.findOne({ where: { id } })
         .then((user) => done(null, user))
         .catch((err) => done(err))
   })

   // 전략 등록
   local()
   google()
}
