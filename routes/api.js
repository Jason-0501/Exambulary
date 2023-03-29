const express = require('express')
const route = express.Router()
const User = require('../models/user')


function auth(req, res, next) {
  if (req.session.user) {
  console.log('authenticated')
  next()
  } else {
  console.log('not authenticated')
  return res.redirect('/api/login')
  }
}

route.get('/',  (req, res) => {
    res.redirect('api/login')
})

route.get('/login', (req, res) => {
  res.render('loginpagetest', {status: {}})
})

route.get('/register', (req, res) => {
  res.render('regipage')
  console.log(req.session.user)
})

route.get('/homepage', auth , (req, res) => {
  res.render('mainpage')
  console.log(req.session.user)
})

route.post('/login', (req, res) => {
  const {userAccount, userPassword} = req.body
  User.findOne({userAccount : userAccount}).then(user => {
      if(!user){
        // res.send('使用者不存在')
        res.render('loginpage', {status:"使用者不存在"})
      } else if(user.userPassword !== userPassword){
        // res.send('密碼錯誤')
        res.render('loginpage', {status:"密碼錯誤"})
      } else {
        // res.send('登入成功')
        req.session.user = user.userAccount
        res.redirect('/api/homepage')
      }
  })
  .catch(err => console.log(err))
})

route.get('/logout', auth, (req, res) => {
  req.session.destroy(() => {
    console.log('session destroyed')
  })
  res.render('loginpage', { status: "登出成功"})
})

module.exports = route