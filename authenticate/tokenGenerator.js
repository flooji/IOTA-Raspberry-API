const jwt = require('jsonwebtoken')

//sign claim -> generate JSON web token
exports.token = (payload,privateKey) => {
    return jwt.sign(payload, privateKey,{ algorithm: 'RS256' })
}