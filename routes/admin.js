const express = require('express')
const route = express.Router()
const { gotoadminlogin,adminlogin,adminhomepage,adminlogout} = require('../controller/admincontroller')

//admin登入驗證function
function adminauth(req, res, next) {
    if (req.session.admin) {
      next()
    } else {
      return res.redirect('/user/homepage')
    }
}
//登入驗證function
function auth(req, res, next) {
  if (req.session.user) {
    next()
  } else {
    return res.redirect('/login')
  }
}
route.get('/', auth ,gotoadminlogin)

//登出
route.get('/logout', adminauth, adminlogout)

//進到Admin頁面
route.get('/homepage',adminauth, adminhomepage)

//送登入資料
route.post('/login',auth, adminlogin)

module.exports = route