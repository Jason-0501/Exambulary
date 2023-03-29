// 載入 Mongoose 並載入 mongoose.Schema 功能
const mongoose = require('mongoose')
const Schema = mongoose.Schema



// 使用 new Schema() 宣告資料
// const daySchema = new Schema({
//   wordNum:{
//     type: Number,
//     required: true
//   },
//   unitNum: {
//     type: Number,
//     required: true
//   },
//   day: {
//     type: Number,
//     required: true
//   }
// })

const userSchema = new Schema({

  userAccount: {
    type: String,
    required: true
  },
  userPassword: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  age: {
      type: Number,
      required: true
    },
  coin: {
      type: Number,
      required: true,
      default:0
    },
  learningTime: {
      type: Number,
      required: true,
      default:0
    },
  userEmail: {
      type: String,
      required: true,
  },
  adminPassword: {
    type: String,
    required: true,
  },
  day: {
      // type: [{
      //   wordNum : Number,
      //   unitNum : Number,
      //   day : Number
      // }],
      type : [Object],
      required: true
    },
  history: {
    type : [Object]
  },
  randomhistory: {
    type : [Object]
  },
  createdAt: {
    type: Date,
    default: Date.now  // 取得當下時間戳記
  }
})

const User = mongoose.model('user', userSchema)
module.exports = User