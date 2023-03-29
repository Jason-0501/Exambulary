const fs = require('fs')
const User = require('../models/user')

function jsontoObject(filename) {
    try {
        const data = fs.readFileSync(`./data/${filename}`, 'utf-8')
        return JSON.parse(data)
    } catch (err) {
        console.log(err)
    }
}
async function findbyunitNum(Num , userAccount) {
    const result = await User.find({userAccount: userAccount})
    const dayArray = result[0].day;
    
    let all = dayArray.filter(dayArray=> dayArray.unitNum === Num)
    console.log(all)
    return all 
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

module.exports = {
    jsontoObject,
    findbyunitNum,
    shuffle
}