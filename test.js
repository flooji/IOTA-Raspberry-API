let {token} = require('./authenticate/tokenGenerator')
let fs = require('fs')

const claim =  fs.readFileSync('./authenticate/IDclaim.json')
const privateKey = fs.readFileSync('./authenticate/privateKey.pem')

token(claim,privateKey)