//Require MAM package from iota.js
const Mam = require('@iota/mam')
const { asciiToTrytes } = require('@iota/converter')

const fs = require('fs')

//GPS setup
const GPS = require('gps')
const gps = new GPS

//Interval of getting GPS data
const interval = 15 //every x sec

//Counter
const counter = 0

//Serial port setup
const SerialPort = require('serialport')
const parsers = SerialPort.parsers

const file = '/dev/ttyS0' //Port address

const parser = new parsers.Readline({
    delimiter: '\r\n'
  })
  
  const port = new SerialPort(file, {
    baudRate: 9600
  })


port.on('error', function(err) {
  console.log(`Error with port configuration: \n${err}\nExit program`)
  process.exit(1)
})

port.pipe(parser) //Parse data from port

//MAM setup
const mode = 'restricted'
const sideKey = 'VERYSECRETKEYFORME'
const provider = 'https://nodes.devnet.iota.org'
const mamExplorerLink = `https://mam-explorer.firebaseapp.com/?provider=${encodeURIComponent(provider)}&mode=${mode}&key=${sideKey.padEnd(81, '9')}&root=`

//Put your own seed here 
const seed = 'LHOSEFEJOREBERAKWDFHIWMA9DKGFOEPJBLWWVRTFRZBZSTVOZZWRVWRDDQMKIRYVRFXBQDYNEHAXPTED'

//Initialize MAM state object
Mam.init(provider,seed)

//Recover previous MAM state
let stored = fs.readFileSync('mam_state.json','utf8')
//console.log('Stored: ',stored)

let mamState = JSON.parse(stored)
console.log('MamState: ',mamState)

//Change MAM state to previous and change mode
Mam.changeMode(mamState, mode, sideKey)

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

    if(counter===0){ //the first root should be stored in order to track the entire channel
      fs.writeFileSync('root.json',JSON.stringify(message.root))
      counter++
    }

    console.log('Published', packet, '\n');
    return message.root
}

const publishGPS = async () => {
  if(gps.state.lat){ //checks if GPS signal is available
  let dataObj = {
    time:   gps.state.time,
    lat:    gps.state.lat,
    lon:    gps.state.lon,
    alt:    gps.state.alt,
    speed:  gps.state.speed,  
    processedLines: gps.state.processed,
  }
  const root = await publish({
    message: dataObj,
    timestamp: (new Date()).toLocaleString()
  })

  console.log(`Verify with MAM Explorer:\n${mamExplorerLink}${root}\n`)
  console.log('Root: ',root)
  return root
} else console.log(`No GPS-signal... Will try again in ${interval} seconds.`)
}

//Set interval to publish data
setInterval(publishGPS,interval*1000)

//Update GPS state object when data available
parser.on('data', function(data) {
  gps.update(data)
})
