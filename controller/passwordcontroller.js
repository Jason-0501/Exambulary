const crypto = require("crypto");
// 載入設定
const config = require('../config')

const algorithm = "aes-256-cbc";
const key = config.specialkey

const inputEncoding = "utf8" // 加密格式 常見： "utf8" | "hex" | "base64"
const outputEncoding = "hex" // 輸出格式 常見： "utf8" | "hex" | "base64"

const iv = crypto.randomBytes(16)


// 加密器
const encrypter = (userPassword) => {
    const encrypter = crypto.createCipheriv(algorithm, key, iv);
    let encryptedMsg = encrypter.update(userPassword, inputEncoding, outputEncoding);
    encryptedMsg += encrypter.final(outputEncoding);
    return encryptedMsg
}

// 解密器
const decrypter = (encryptpasseord) => {
    const decrypter = crypto.createDecipheriv(algorithm , key, iv);
    let decryptedMsg = decrypter.update(encryptpasseord, outputEncoding, inputEncoding);
    decryptedMsg += decrypter.final(inputEncoding);
    return decryptedMsg
}

//SHA產生
const computeSHA256 = (password) => {
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    return hash
}


//hash驗證
const verifyHash = (password, hash) => { 
    const computedHash = crypto.createHash('sha256').update(password).digest('hex'); 
    return computedHash === hash; 
  } 

module.exports = {
    encrypter,decrypter,verifyHash,computeSHA256
}
