const express = require('express')
const route = express.Router()
const mongoose = require('mongoose') //
const _ = require('lodash') //
const Vocabulary = require('../models/vocabulary') //
const User = require('../models/user') //
const functions = require('../services/functions') //

const {homepage,select,logout,history,study,test,randomtest,result,randomresult,wordsheet,randomhistory,selectwordsheet,randomselect} = require('../controller/studycontroller')

//登入驗證function
function auth(req, res, next) {
  if (req.session.user) {
    next()
  } else {
    return res.redirect('/login')
  }
}

//顯示首頁
route.get('/homepage', auth, homepage)

//顯示挑(單元學習or全部)
route.get('/select', auth, select)

//登出
route.get('/logout', auth, logout)

//顯示歷史作答
route.get('/history', auth, history)

//顯示隨機測驗歷史作答
route.get('/randomhistory', auth , randomhistory)

//顯示randomselect
route.get('/randomselect', auth , randomselect)

//顯示selectwordsheetPage
route.get('/selectwordsheet', auth , selectwordsheet)

//出題到study
route.post('/study', auth, study)

//從study拿題目陣列在出題到test
route.post('/test', auth, test)

//隨機出題(出testAmount數量，不會變更day)
route.post('/randomtest', auth, randomtest)

//顯示測驗結果
route.post('/result', auth, result)

//顯示隨機分配測驗的結果
route.post('/randomresult', auth, randomresult)

//依照使用者挑選的單元顯示單字 依照wrong的次數由大到小顯示
route.post('/wordsheet', auth , wordsheet)


////////////////////////////////////////////////測驗用////////////////////////////////////////////////

route.get('/test1', async (req, res) => {
  //用userAccount與unitNum抓出該user的特定單元裡day=0的單字
  const { userAccount, unitNum } = req.body
  const query = User.find({ userAccount: userAccount });
  query instanceof mongoose.Query; // true
  const result = await query; // Get the documents
  //const dayArray = result[0].day;
  let all = result[0].day.filter(dayArray => dayArray.unitNum === unitNum)
  all = all.filter(all => all.day === 0)
  const wordArray = all.map(obj => {
    return {
      "wordNum": obj.wordNum
    };
  })
  Vocabulary.find().or(wordArray).then(vocabulary => {
    /*logic here*/
    res.json(vocabulary)
    //res.render('testpage', { data: vocabulary, unit: unitNum})
  })
    .catch(error => {
      /*error logic here*/
      console.error(error)
    })
})

route.get('/change', async (req, res) => {
  const wordNum = 607
  const userAccount = 'B10909004'
  //透過userAccount與wordNum去update User裡的特定單字day.day的值
  await User.updateOne(
    { userAccount: userAccount, 'day.wordNum': wordNum },//Finding Product with the particular price
    { $set: { 'day.$.day': 1 } },
    res.send('變更完成')
  );


})
route.post('/test2', (req, res) => {
  const { userAccount, unitNum } = req.body
  User.find({ userAccount: userAccount }, (err, result) => {
    if (err) {
      return console.error(err)
    }
    const dayArray = result[0].day;
    let all = dayArray.filter(dayArray => dayArray.unitNum === unitNum)
    res.send(all)
  })

  // const query = User.find({userAccount : userAccount});
  // query instanceof mongoose.Query; // true
  // const result = await query; // Get the documents
  // const dayArray = result[0].day;
  // let all = dayArray.filter(dayArray=> dayArray.unitNum === unitNum)
  // res.send(all)

  //const unit =  req.body.unitNum

  //挑出這個單元全部單字
  // Vocabulary.find({unitNum : unit}, (err, vocabulary) => {
  //     if (err) {
  //         return console.error(err)
  //       }
  //       res.render('testpage', { data: vocabulary, unit: unit})
  // })


  //隨機挑?個單字來測驗
  // Vocabulary.aggregate([
  //     {$match: {unitNum: parseInt(unit)}},
  //     {$sample: {size: 5}}
  // ], function(err, docs) {
  //     if (err) {
  //         return console.error(err)
  //     }
  //     res.render('testpage', { data: docs, unit: unit})
  // });

})

module.exports = route