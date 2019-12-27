var http = require('http')
var express = require('express')
var id = require('./create_ID')
var tokenGenerator = require('./authenticate/tokenGenerator')
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
        let payload = tokenGenerator.token()
        res.status(200).send({jwt:payload})
        console.log('Authentication request')
    } catch(err) {
        res.status(403).send('Could not authenticate device')
    }
}) 
//Express route to create a new claim
// app.post('/create-claim', (req, res) => {
//     const data = req.body.data
//     id.createPackagingUnit(data).then(result => {
//         console.log('Claim created')
//         res.status(200).send(result)
//     })
// })
app.get('/create-claim', function (req, res) {
    //convert into POST request /get data from form-------------------------------------------------------TBD 
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
