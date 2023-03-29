const User = require('../models/user')
const {verifyHash} = require('./passwordcontroller')
const _ = require('lodash')

//導到user/homepage登入頁面
const gotoadminlogin =  (req, res) => {
    res.redirect('/user/homepage')
}
//送Admin登入資料
const adminlogin = (req, res) => {
    const userAccount = req.session.user
    const adminPassword = req.body.adminPassword
    User.findOne({userAccount : userAccount}).then(user => {
        if(verifyHash(adminPassword,user.adminPassword)){  //decrypter(user.userPassword) === userPassword
          req.session.admin = user._id.toString()
          req.session.name = user.user
          res.redirect('/admin/homepage')
        } else {
          res.render('mainpage',{username: req.session.name, status: false})
        }
    })
    .catch(err => console.log(err))
}
const adminhomepage = async(req, res) => {
  const userAccount = req.session.user
  const user = await User.findOne({ userAccount : userAccount}).exec()
  const returnArray = []
  let historyArray = user.history
  historyArray = _.sortBy(historyArray, ['date'])
  const sortedByDate = historyArray.reverse()
  for(const check of sortedByDate){
    try {
      const returnYear = check.date.getFullYear()
      const returnMonth = check.date.getMonth()+1
      const returnDay = check.date.getDate()
      const returnObj = {
        year : returnYear,
        month : returnMonth,
        day : returnDay,
        unitNum : check.unitNum,
        totalNum : check.totalNum,
        correctNum : check.correctNum,
        wrongNum : check.wrongNum,
        coin :　check.coin
      }
      returnArray.push(returnObj)
    } catch (error) {
      console.error(error)
    }
  }
  
    res.render('adminhomepage',{data: returnArray})
}

//admin登出
const adminlogout = (req, res) => {
  delete req.session.admin 
  console.log('admin session destroyed')
  res.redirect('/user/homepage')
}

module.exports = {
    gotoadminlogin,adminlogin,adminhomepage,adminlogout
}