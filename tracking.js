//Setup general------------------------------------------------------------
var counter = 0 //necessary to write the first root into a file

//MAM setup----------------------------------------------------------------

//Require MAM package from iota.js
const Mam = require('@iota/mam')
const { asciiToTrytes } = require('@iota/converter')

const fs = require('fs')

//MAM setup
const mode = 'restricted'
const sideKey = 'GPSTRACKERSCCHAIN'
const provider = 'https://nodes.devnet.iota.org'
const mamExplorerLink = `https://mam-explorer.firebaseapp.com/?provider=${encodeURIComponent(provider)}&mode=${mode}&key=${sideKey.padEnd(81, '9')}&root=`

//Put your own seed here 
const seed = 'BSIFU9HDPLRQNRKIKBJXYJYWBSPCQIMZQIHZDUG9BCSVRINUJMDEHLUUKEAVRZZWNSTVJVVDXGDJMJERZ'

//Initialize MAM state object
Mam.init(provider,seed)

//Recover previous MAM state
let stored = fs.readFileSync('mam_state.json','utf8')
//console.log('Stored: ',stored)

let mamState = JSON.parse(stored)
console.log('MamState: ',mamState)

//Change MAM state to previous and change mode
Mam.changeMode(mamState, mode, sideKey)

//Serial and GPS setup----------------------------------------------------------------------

//GPS setup
const GPS = require('gps')
const gps = new GPS //create GPS state object

//Interval of getting GPS data
const interval = 15 //every x sec

//Serial port configuration
const SerialPort = require('serialport')
const parsers = SerialPort.parsers

//Port address
const file = '/dev/ttyS0'

const parser = new parsers.Readline({
  delimiter: '\r\n'
})
const port = new SerialPort(file, {
  baudRate: 9600
})

//Parse data from port
port.pipe(parser)

console.log(`Serial port ${file} is opened and configured.\nMessages will appear all ${interval} sec. Please wait...`)

//Functions----------------------------------------------------------------------------

//Get single parameters from GPS state object
const getGPS = () => {

let packet = {
	      time:   gps.state.time,
        lat:    gps.state.lat,
        lon:    gps.state.lon,
        alt:    gps.state.alt,
        speed:  gps.state.speed,  
        processedLines: gps.state.processed,
    }

    console.log(packet)
    return packet
}

// Publish to tangle
const publish = async packet => {
  // Create MAM Payload - STRING OF TRYTES
  const trytes = asciiToTrytes(JSON.stringify(packet))
  const message = Mam.create(mamState, trytes)

  // Save new mamState
  mamState = message.state
  fs.writeFileSync('mam_state.json',JSON.stringify(mamState))

  // Attach the payload
  await Mam.attach(message.payload, message.address, 3, 9)

  if(counter==0){ //the first root should be stored in order to track the entire channel
    fs.writeFile(`root.json`, JSON.stringify({root: message.root, link:`${mamExplorerLink}${message.root}`}), function (err) {
        if (err) throw err
     })
    counter++
   }
  console.log('Published', packet, '\n')
  console.log('Address', message.address, '\n')
  return message.root
}

const publishGPS = async () => {
  if(gps.state.lat) {
    let gpsData = getGPS()

    const root = await publish({
    message: gpsData,
    timestamp: (new Date()).toLocaleString()
  })
  console.log(`Verify with MAM Explorer:\n${mamExplorerLink}${root}\n`)
  console.log('Root: ',root,'\n')
  return root
  } else {
    console.log(`No GPS-signal... Will try again in ${interval} seconds.\n`)
  }
  //Even if no signal is available the first message will be published
  if(counter==0) {
    let gpsData = getGPS()

    const root = await publish({
      message: gpsData,
      timestamp: (new Date()).toLocaleString()
    })
    return root
  }
}

//action--------------------------------------------------------------
//update GPS state object when data available
parser.on('data', function(data) {
  gps.update(data)
})

publishGPS()

//Set interval to get GPS data
setInterval(publishGPS,interval*1000)

port.on('error', function(err) {
  console.log(`Error with port configuration: \n${err}\nExit program`)
  process.exit(1)
})
