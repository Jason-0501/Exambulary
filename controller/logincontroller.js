const User = require('../models/user')
const functions = require('../services/functions')
const {encrypter,decrypter,verifyHash,computeSHA256} = require('./passwordcontroller')


//導到登入頁面
const gotologin =  (req, res) => {
    res.redirect('/login')
}
//進到登入頁面
const loginView = (req, res) => {
    res.render('loginpage', {status: {}})
}
//進到註冊頁面
const registerView = (req, res) => {
    res.render('regipage', {status: {}})
}
//送註冊資料
const register = (req, res) => {
    // 取得使用者註冊資料
    const { userAccount, userPassword, user, age, userEmail,adminPassword } = req.body
    const day = functions.jsontoObject('day.json')
    // 檢查該信箱是否已經註冊
    User.findOne({ userAccount }).then(result => {
        // 如果已經註冊：退回原本畫面
        if (result) {
            res.render('regipage', {status: "這個帳號已經被註冊過了"})
        } else {
          // 如果還沒註冊：寫入資料庫
          return User.create({
            userAccount,
            //userPassword : encrypter(userPassword),
            userPassword : computeSHA256(userPassword),
            user,
            age,
            day,
            userEmail,
            //adminPassword : encrypter(adminPassword),
            adminPassword : computeSHA256(adminPassword)
          })
            .then(() => {res.render('loginpage', {status: "註冊成功"})})
            .catch(err => console.log(err))
        }
      })
}
//送登入資料
const login = (req, res) => {
    const {userAccount, userPassword} = req.body
    User.findOne({userAccount : userAccount}).then(user => {
        if(!user){
          res.render('loginpage', {status:"使用者不存在"})
        } else if(verifyHash(userPassword,user.userPassword)){  //decrypter(user.userPassword) === userPassword
          req.session.user = user.userAccount
          req.session.name = user.user
          res.redirect('/user/homepage')
        } else {
          res.render('loginpage', {status:"密碼錯誤"})
        }
    })
    .catch(err => console.log(err))
}

module.exports = {
    gotologin,
    loginView,
    registerView,
    register,
    login
}