var http = require('http')
var express = require('express')
var id = require('./create_ID')

var app = express()

var inputs = [{ pin: '11', gpio: '17', value: 1 },
              { pin: '12', gpio: '18', value: 0 }]

app.use(express['static'](__dirname ))

// Express route for incoming requests for a customer name
app.get('/inputs/:id', function(req, res) {
    res.status(200).send(inputs[req.params.id])
  })

// app.post('/handle',function(req,res){
//     var query= req.body.var2
//     console.log(query)
// })

// Express route for incoming requests for a list of all inputs
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
}) // apt.get()
  
  
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