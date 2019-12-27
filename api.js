var http = require('http')
var express = require('express')
var id = require('./create_ID')
var {token} = require('./authenticate/tokenGenerator')
var {setupTracking,startTracking} = require('./helpers.js')
var fs = require('fs')

var app = express()
app.use(express['static'](__dirname ))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next()
})

//Express route to authenticate a device
app.get('/authenticate', function (req, res) {
    try {
        const claim =  fs.readFileSync('./authenticate/IDclaim.json')
        const privateKey = fs.readFileSync('./authenticate/privateKey.pem')
        let payload = token(claim,privateKey)
        res.status(200).send({jwt:payload})
        console.log('Authentication request')
    } catch(err) {
        res.status(403).send('Could not authenticate device')
    }
}) 

app.get('/create-claim', function (req, res) {
    let data = {
        commodityGroup: 'Cameras',
        seriesNumber: '101010',
        numberOfItems: '38',
        valueOfItem: '59',
        currencyOfPrice: 'CHF',
        owner: 'Sony Corporation',
        deliveryDate: '27/01/2019'
    }
    id.createPackagingUnit(data).then(result => {
        console.log('Claim created')
        res.status(200).send(result)
    })
}) 

app.get('/create-tracking', function(req,res) {
    //const data = req.body.data //receive expiration date
    //const expiration = data.expirationDate
    const sideKey = setupTracking()
    const result = startTracking(sideKey)
    if(result){
     res.status(200).send(sideKey)
    } else {res.status(403).send('Could not start tracking.')}
})
  
  
// Express route for any other unrecognised incoming requests
app.get('*', function(req, res) {
    res.status(404).send('Unrecognised API call')
})
  
// Express route to handle errors
app.use(function(err, req, res, next) {
    if (req.xhr) {
        res.status(500).send('Oops, Something went wrong!')
    } else {
        next(err)
    }
})

app.listen(3000)
console.log('App Server is listening on port 3000');
