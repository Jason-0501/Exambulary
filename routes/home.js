const express = require('express')
const route = express.Router()
const { gotologin, loginView, registerView, register, login} = require('../controller/logincontroller')

//登入狀態下不讓他進到登入頁面跳轉到homepage
function logauthtohome(req, res, next) {
  if (req.session.user) {
    return res.redirect('/user/homepage')
  } else {
    next()
  }
}

route.get('/', logauthtohome, gotologin)
//登入
route.get('/login', logauthtohome, loginView)  
//註冊
route.get('/register', registerView)
//送註冊資料
route.post('/register', register)
//送登入資料
route.post('/login', login)

module.exports = route