const jwt = require('jsonwebtoken')
const fs = require('fs')

const payload =  fs.readFileSync('./claim_9f412cc5-ee81-4e54-b493-1a5528b5f367.json')
const privateKey = fs.readFileSync('./privateKey.pem')


//sign claim -> generate JSON web token
exports.token = jwt.sign(payload, privateKey,{ algorithm: 'RS256' })

