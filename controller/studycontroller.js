const mongoose = require('mongoose')
const _ = require('lodash')
const Vocabulary = require('../models/vocabulary')
const User = require('../models/user')
const functions = require('../services/functions')

//顯示首頁
const homepage = (req, res) => {
    res.render('mainpage', { username: req.session.name, status: true })
}
//顯示挑(單元學習or全部)
const select = (req, res) => {
    res.render('selectpage')
}
//登出
const logout = (req, res) => {
    req.session.destroy(() => {
      console.log('session destroyed')
    })
    res.render('loginpage', { status: "登出成功" })
}
//顯示歷史作答
const history = async (req, res) => {
  const userAccount = req.session.user
  const user = await User.findOne({ userAccount : userAccount}).exec()
  const returnArray = []
  // console.log(user.history)
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
  console.log(returnArray)
    // res.render('historypage',{data : returnArray})
}
//顯示隨機測驗的歷史作答
const randomhistory = async (req, res) => {
  const userAccount = req.session.user
  const returnArray = []
  const user = await User.findOne({ userAccount : userAccount}).exec()
  let randomhistoryArray = user.randomhistory
  randomhistoryArray = _.sortBy(randomhistoryArray, ['date'])
  const sortedByDate = randomhistoryArray.reverse()
  for(const check of sortedByDate){
    try {
      const date = check.date
      const returnYear = date.getFullYear()
      const returnMonth = date.getMonth()+1
      const returnDay = date.getDate()
      const returnObj = {
        year : returnYear,
        month : returnMonth,
        day : returnDay,
        totalNum : check.totalNum,
        correctNum : check.correctNum,
        wrongNum : check.wrongNum,
        coin : check.coin
      }
      returnArray.push(returnObj)
    } catch (error) {
      console.error(error)
    }
  }
  console.log(returnArray)
    // res.render('randomhistorypage',{data : returnArray})
}
//出題到study
const study = async (req, res) => {
    //form web user
    const unitNum = parseInt(req.body.unitNum)
    var testAmount = parseInt(req.body.testAmount)
    var unitinfo = ""
    const userAccount = req.session.user
  
    //form database
    const result = await User.find({ userAccount: userAccount }).exec()
    const dayArray = result[0].day;
    var unitArray = dayArray.filter(dayArray => dayArray.unitNum === unitNum) //array of Vocabulary = unitNum
    var testArray = unitArray.filter(all => all.day === 0) //array of (Vocabulary = unitNum) & (day =0)
  
    //運用userAccount與unitNum和testAmount尋找該user的特定單元裡day=0的單字和剩餘天數較少單字來出題
    if (unitNum <= 37 && unitNum >= 1) {
      if (Number.isNaN(testAmount)) {
        testAmount = parseInt(unitArray.length)
      }
      if (testArray.length < testAmount) {          //若測驗數量大於day=0數量，把補剩餘天數較少的單字補滿到測驗數量
        notzeroArray = unitArray.filter(all => all.day != 0)   //找出day非0的單字
        if ((testAmount - testArray.length) > notzeroArray.length) {   //若(測試數量)-(day=0數量)大於非0數量，則就把那單元的題目全部出出來。
          testArray = testArray.concat(notzeroArray)
        } else {
          notzeroArray = _.sortBy(notzeroArray, ['day']) //依day由小排到大
          notzeroArray = notzeroArray.slice(0, testAmount - testArray.length) //取剩下不夠測驗的單字
          testArray = testArray.concat(notzeroArray) //把day=0跟不夠測驗的單字弄一起
        }
      } else {                                      //當day=0數量>測驗數量 隨機挑testAmount個出來測驗
        testArray = _.sampleSize(testArray, testAmount)
      }
      unitinfo = req.body.unitNum
    //從全部單字中出testAmount個單子來測驗，
    } else if (unitNum == 38) {
      testArray = dayArray.filter(all => all.day === 0)
      if (testArray.length < testAmount) {          //若測驗數量大於day=0數量，把補剩餘天數較少的單字補滿到測驗數量
        notzeroArray = testArray.filter(all => all.day != 0)   //找出day非0的單字
        if ((testAmount - testArray.length) > notzeroArray.length) {   //若(測試數量)-(day=0數量)大於非0數量，則就把那單元的題目全部出出來。
          testArray = testArray.concat(notzeroArray)
        } else {
          notzeroArray = _.sortBy(notzeroArray, ['day']) //依day由小排到大
          notzeroArray = notzeroArray.slice(0, testAmount - testArray.length) //取剩下不夠測驗的單字
          testArray = testArray.concat(notzeroArray) //把day=0跟不夠測驗的單字弄一起
        }
      } else {                                      //當day=0數量>測驗數量 隨機挑testAmount個出來測驗
        testArray = _.sampleSize(testArray, testAmount)
      }
      unitinfo = "All unit"
    }
    const wordArray = testArray.map(obj => {
      return {
        "wordNum": obj.wordNum
      }
    })
    //傳送單字資訊去前端    
    Vocabulary.find().or(wordArray).then(vocabulary => {
      /*logic here*/
      vocabulary = functions.shuffle(vocabulary) //打亂出題順序
      res.render('studypage', { data: vocabulary, unitNum: unitinfo })
    })
      .catch(error => {
        /*error logic here*/
        console.error(error)
      })
}
//從study拿題目陣列在出題到test
const test = async (req, res) => {
    //form web user
    const word = JSON.parse(req.body.word)
    const unitNum = req.body.unitNum
  
    //傳送單字資訊去前端    
    Vocabulary.find().or(word).then(vocabulary => {
      /*logic here*/
      vocabulary = vocabulary.map(obj => {    //只給wordNum,length,zhuying,chinese
        return {
          "word" : obj.word,
          "wordNum": obj.wordNum,
          "length": obj.length,
          "zhuying": obj.zhuying,
          "chinese": obj.chinese
        }
      })
      //
      vocabulary = functions.shuffle(vocabulary) //打亂出題順序
      res.render('testpage', { data: vocabulary, unitNum: unitNum})
    })
      .catch(error => {
        /*error logic here*/
        console.error(error)
      })
} 
//隨機出題(出testAmount數量，不會變更day)
const randomtest = async (req, res) => {
    var testAmount = parseInt(req.body.testAmount)
    Vocabulary.aggregate([
        {$match: {}},
        {$sample: {size: testAmount}}
    ], function(err, docs) {
        if (err) {
            return console.error(err)
        }
        docs = functions.shuffle(docs) //打亂出題順序
        res.render('randomtestpage', { data: docs , unitNum: "random"})
    });
}
//顯示測驗結果
const result = async (req, res) => {
    const userAccount = req.session.user
    const userAnswer = JSON.parse(req.body.userAnswer)
    const results = [] // 存放查詢結果的陣列
    const returnArray = []
    let index = 0
    let correctNum = 0
    let wrongNum = 0
    let totalNum = 0
    let unitNum = 0
    for (const check of userAnswer) {
      try {
        const result = await Vocabulary.find({ wordNum: check.wordNum }).exec()
        // 將查詢到的單字存入results
        results.push(result)
        // 將results陣列分割成一個一個
        const wordModel = results.map(result => result[0])
        //抓出該次測驗的單元
        unitNum = wordModel[0].unitNum
        //使用者答對的情況
        if (check.answer === wordModel[index].word) {
          ++correctNum
          //抓出符合userAccount的使用者
          const user = await User.findOne({
            userAccount: userAccount,
          });
          // 找出該使用者day陣列裡的wordNum與題目相同的該陣列
          const beforeUpdatedCorrect = user.day.find((day) => day.wordNum === wordModel[index].wordNum);
          //將該陣列裡的correct進行更改
          const updatedCorrect = await User.findOneAndUpdate(
            { userAccount: userAccount, 'day.wordNum': wordModel[index].wordNum },
            { $inc: { 'day.$.correct': beforeUpdatedCorrect.correct >= 0 && beforeUpdatedCorrect.correct < 5 ? 1 : 0 } },
            { new: true }
          );
          //找出更改Correct後的陣列
          const AfterUpdatedCorrect = await updatedCorrect.day.find((day) => day.wordNum === wordModel[index].wordNum);
          //將更改後的Correct作為參照 更改day的值
          const updatedDay = await User.findOneAndUpdate(
            { userAccount: userAccount, 'day.wordNum': wordModel[index].wordNum },
            { $set: { 'day.$.day': Math.pow(2, AfterUpdatedCorrect.correct) } },
            { new: true }
          )
          //找出更改後的day值
          const afterday = await updatedDay.day.find((day) => day.wordNum === wordModel[index].wordNum).day
          let day = new Date()
          day.setDate(day.getDate() + afterday)
          const resultYear = day.getFullYear()
          const resultMonth = day.getMonth()+1
          const resultDay = day.getDate()
  
          //建立要回傳的物件
          const returnobj = {
            word: wordModel[index].word,
            kk : wordModel[index].kk,
            answer: check.answer,
            chinese: wordModel[index].chinese,
            TrueOrFalse: true,
            year : resultYear,
            month : resultMonth,
            day: resultDay
          }
          //將回傳的物件傳入要回傳的陣列當中
          returnArray.push(returnobj)
        }
        //使用者答錯的情況
        else {
          ++wrongNum
          //抓出符合userAccount的使用者
          const user = await User.findOne({
            userAccount: userAccount,
          });
          //找出該使用者day陣列裡的wordNum與題目相同的該陣列
          const beforeUpdatedCorrect = user.day.find((day) => day.wordNum === wordModel[index].wordNum);
          //將該陣列裡的correct進行更改
          const updatedCorrect = await User.findOneAndUpdate(
            { userAccount: userAccount, 'day.wordNum': wordModel[index].wordNum },
            { $inc: { 'day.$.correct': beforeUpdatedCorrect.correct > 0 && beforeUpdatedCorrect.correct <= 5 ? -1 : 0 } },
            { new: true }
          );
          //找出更改Correct後的陣列
          const AfterUpdatedCorrect = await updatedCorrect.day.find((day) => day.wordNum === wordModel[index].wordNum);
          //將更改後的Correct作為參照 更改day的值
          const updatedDay = await User.findOneAndUpdate(
            { userAccount: userAccount, 'day.wordNum': wordModel[index].wordNum },
            { $set: { 'day.$.day': Math.pow(2, AfterUpdatedCorrect.correct) } },
            { new: true }
          )
          //更改day陣列裡面的wrong
          const updatedWrong = await User.findOneAndUpdate(
            { userAccount: userAccount, 'day.wordNum': wordModel[index].wordNum },
            { $inc: { 'day.$.wrong': 1 } },
            { new: true }
          )
          //找出更改後的day值
          const afterday = await updatedDay.day.find((day) => day.wordNum === wordModel[index].wordNum).day
          let day = new Date()
          day.setDate(day.getDate() + afterday)
          const resultYear = day.getFullYear()
          const resultMonth = day.getMonth()+1
          const resultDay = day.getDate()
          //    建立要回傳的物件
          const returnobj = {
            word: wordModel[index].word,
            kk : wordModel[index].kk,
            answer: check.answer,
            chinese: wordModel[index].chinese,
            TrueOrFalse: false,
            year : resultYear,
            month : resultMonth,
            day: resultDay
          }
  
          //將回傳的物件傳入要回傳的陣列當中
          returnArray.push(returnobj)
        }
        ++index
      } catch (err) {
        console.error(err)
      }
    }
    totalNum = correctNum + wrongNum
    const coin = 1
    //將使用者獲得的代幣更新到User資料庫
    const updatedCoin = await User.findOneAndUpdate(
      { userAccount: userAccount},
      { $inc: { coin : coin } },
      { new: true }
    )
    //建立history物件
    const historyday = new Date()
    const historyObj = {
      date : historyday,
      unitNum : unitNum,
      totalNum : totalNum,
      correctNum : correctNum,
      wrongNum : wrongNum,
      coin : coin
    }
    //存入history到使用者的資料庫裡
    const saveHistory = await User.findOneAndUpdate(
      { userAccount: userAccount }, 
      { $push: { history: historyObj } }, 
      { new: true })
    // console.log(returnArray)
    // console.log(historyObj)
    res.render('resultpage', { data: returnArray, correctNum : correctNum , wrongNum : wrongNum , totalNum : totalNum})
    // res.send('111')
}
//顯示隨機分配測驗的結果
const randomresult = async (req, res) => {
    const userAccount = req.session.user
    const userAnswer = JSON.parse(req.body.userAnswer)
    const results = [] // 存放查詢結果的陣列
    const returnArray = []
    let index = 0
    let correctNum = 0
    let wrongNum = 0
    let totalNum = 0
    for (const check of userAnswer) {
      try {
        const result = await Vocabulary.find({ wordNum: check.wordNum }).exec()
        // 將查詢到的單字存入results
        results.push(result)
        // 將results陣列分割成一個一個
        const wordModel = results.map(result => result[0])
        //使用者答對的情況
        if (check.answer === wordModel[index].word) {
          ++correctNum
          //建立要回傳的物件
          const returnobj = {
            word: wordModel[index].word,
            kk : wordModel[index].kk,
            answer: check.answer,
            chinese: wordModel[index].chinese,
            TrueorFalse: true,
          }
          //將回傳的物件傳入要回傳的陣列當中
          returnArray.push(returnobj)
        }
        //使用者答錯的情況
        else {
          ++wrongNum
          //    建立要回傳的物件
          const returnobj = {
            word: wordModel[index].word,
            kk : wordModel[index].kk,
            answer: check.answer,
            chinese: wordModel[index].chinese,
            TrueorFalse: false,
          }
          //將回傳的物件傳入要回傳的陣列當中
          returnArray.push(returnobj)
        }
        ++index
      } catch (err) {
        console.error(err)
      }
    }
    totalNum = correctNum + wrongNum 
    const coin = 1;
    //將使用者獲得的代幣更新到User資料庫
    const updatedCoin = await User.findOneAndUpdate(
      { userAccount: userAccount},
      { $inc: { coin : coin } },
      { new: true }
    )
    //建立randomhistory物件
    const randomHistoryday = new Date()
    const randomHistoryObj = {
      date : randomHistoryday,
      totalNum : totalNum,
      correctNum : correctNum,
      wrongNum : wrongNum,
      coin : coin
    }
    const saverandomHistory = await User.findOneAndUpdate(
      { userAccount: userAccount }, 
      { $push: { randomhistory: randomHistoryObj } }, 
      { new: true })
    console.log(returnArray)
    res.render('randomresultpage', { data: returnArray , correctNum : correctNum, wrongNum : wrongNum, totalNum : totalNum})
}
//依照使用者挑選的單元顯示單字 依照wrong的次數由大到小顯示
const wordsheet = async (req, res) => {
    const userAccount = req.session.user
    const unitNum = req.body.unitNum
    const returnArray = []
    let unitArray = []
    let index = 0
    //找出userAccount的資料
    const result = await User.find({ userAccount: userAccount }).exec()
    //將該名userAccount的day陣列 找出符合使用者輸入的unitNum的單字
    let dayArray = result[0].day
    for (const wordModel of dayArray){
      if(wordModel.unitNum == unitNum){
        ++index
        unitArray.push(wordModel)
      }
    }
    //將該unitNum單字陣列依照wrong的次數由小到大進行排列
    unitArray = _.sortBy(unitArray, ['wrong'])
    //將該unitNum單字陣列依照wrong的次數由大到小進行排列
    const wrongArray = unitArray.reverse()
    for(const vocabulary of wrongArray){
      try {
        const word = await Vocabulary.findOne({wordNum : vocabulary.wordNum}).exec()
        const returnObj = {
          word : word.word,
          chinese : word.chinese,
          kk : word.kk,
          wrongNum : vocabulary.wrong
        }
        returnArray.push(returnObj)
      } catch (error) {
        console.error(err)
      }
    }
    // console.log(returnArray)
    res.render('wordsheet',{data : returnArray, unitNum: unitNum})
    // res.send('111')
}
//顯示selectwordsheet頁面
const selectwordsheet = (req, res) => {
  res.render('selectwordsheet')
}
//顯示randomselect頁面
const randomselect = (req, res) => {
  res.render('randomselect')
}

module.exports = {
    homepage,
    select,
    logout,
    history,
    randomhistory,
    study,
    test,
    randomtest,
    result,
    randomresult,
    wordsheet,
    selectwordsheet,
    randomselect
}