const mongoose = require('mongoose')
const Schema = mongoose.Schema

const vocabularySchema = new Schema({
    length: {
        type: Number,
        require: true
    },
    wordNum: {
        type: Number,
        require: true
    },
    word: {
        type: String,
        require: true
    },
    unitNum: {
        type: Number,
        require: true
    },
    chinese: {
        type: String,
        require: true
    },
    zhuying: {
        type: String,
        require: true
    },
    kk: {
        type: String,
        require: true
    },
},{ collection : 'vocabulary' })

const Vocabulary = mongoose.model('vocabulary', vocabularySchema)
module.exports = Vocabulary