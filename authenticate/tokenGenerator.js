const jwt = require('jsonwebtoken')
const fs = require('fs')

//sign claim -> generate JSON web token
exports.token = () => {
    const payload =  fs.readFileSync('./authenticate/IDclaim.json')
    const privateKey = fs.readFileSync('./authenticate/privateKey.pem')
    return jwt.sign(payload, privateKey,{ algorithm: 'RS256' })
}