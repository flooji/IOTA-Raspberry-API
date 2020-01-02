const uuidv4 = require('uuid/v4')
const fs = require('fs')
const Mam = require('@iota/mam')
const { asciiToTrytes } = require('@iota/converter')
const CryptoJS = require('crypto-js')
const shelljs = require('shelljs')

//Create a claim with some predefined attributes and a variable data attribute
exports.createClaim = (data,tracking) => {
    //Create identity document for packaging unit with first root included
    let claim = {
    "subject": uuidv4(),
    "devicePubKey": "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCTOdA8wN524+wb5gqaU5uiliT1S5LoNqDIA2SI5P7VgGsYaH6zByB5jA7+muYCFUWHnWupU4DtEB6D59XgGRLfstxuyOIb7lwW1stsHaQW1UmZ5d04OlwQW2bMHvm1CwEEaOkVij+d6hsMhPTuFnbu1C3KQlGbCTEe5OClvN8DPQIDAQAB",
    "issuerAddress": "WWOTSUHSMXGELOPMDAHFSYXUGEHNIMGVUOSUHISVVUZYPQAQMSOXCWTIEKKYBCNVCBNBS9EWE9IVLDNAW",
    "data": data,
    "trackingRoot": tracking
    }
    return claim
}

//Stores a claim 
exports.storeClaim = claim => {
    //-------------------------------TBD---------make a PDF
    fs.writeFile(`claim_${claim.subject}.json`, JSON.stringify(claim), function (err) {
        if (err) throw err
        // console.log(`File claim_${claim.subject}.json created successfully.`)
    })
}

//Hashes a claim with SHA256
exports.hashClaim = claim => {
    //Hash claim for publishing to tangle
    let hashedClaim = CryptoJS.SHA256(JSON.stringify(claim))
    .toString(CryptoJS.enc.Hex)

    return hashedClaim
}

//Create MAM GNSS channel
exports.setupTracking = () => {
    let mode = 'restricted'
    //Attention this sideKey is pseudo-random and not unique, for production mode use true random generator hardware or API
    let key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    let provider = 'https://nodes.devnet.iota.org'
    let seed = 'ZOEB9BJXYXUNYC9BJDNYJVKWPUDZFZHVMY9OLD9NKCVOUS9BSXHZNIUYYITMRDITKJJSAZPHCIOWXSBQN'
//'ZPVOPXJUGLHIHRIHXTFXWJDOTOLEITWJQMSTAWDIAWJNDTTNFRHUKLPLCRKZPYXZALUABKAYNGIINQMJE'

    //Initialise MAM State
    let initial = Mam.init(provider,seed)

    //Set channel mode
    initial = Mam.changeMode(initial, mode, key)
    // console.log('Initial state: ',initial)

    //Store MAM state in case system breaks down
    fs.writeFileSync('mam_state.json',JSON.stringify(initial))

    return key
}

//Start tracking
exports.startTracking = () => {
     if (shelljs.exec('pm2 start publish-on-same-channel.js --name="publish-on-same-channel.js" --update-env').code !== 0) { //if code is not equal 0, process could not be started
	   console.log('process could not be started')
            return false
        } else {
            return true
        }
}

//Stop tracking
exports.stopTracking = () => {
    if(shelljs.exec('pm2 pid publish-on-same-channel.js') !== null) { //if result is not null, process does exist, so it can be deleted
        if (shelljs.exec('pm2 delete publish-on-same-channel.js').code !== 0) { //if exit code is not 0, deletion failed
            console.log('process could not be deleted')
            return false
        } else {
            return true
        }
    } else {
	console.log('process does not exist')
        return false
    }
}

//Publishes Identity-claim to tangle
exports.registerIdentity = async hash => {
    //Mam setup
    let mode = 'restricted'
    let sideKey = 'XuL34ALSer' //could change with updates
    let provider = 'https://nodes.devnet.iota.org'
    let mamExplorerLink = `https://mam-explorer.firebaseapp.com/?provider=${encodeURIComponent(provider)}&mode=${mode}&root=`
    
    //Replace with your own seed, generated (on Linux terminal) with: cat /dev/urandom |tr -dc A-Z9|head -c${1:-81}
    let seed = 'Q9NAKGEEQIAZNJLACPCJWVBBWJSWLIJZZCMHDZLZODNHSVGYQW9JAWP9SXQNP9WCJALZIHCEXLDMKWJAP'

    //Initialise MAM state object
    let mamState = Mam.init(provider,seed)
    mamState = Mam.changeMode(mamState, mode, sideKey)

    //Packet to be published
    const packet = {
        message: hash,
        timestamp: (new Date()).toLocaleString()
    }

    // Create MAM Payload - STRING OF TRYTES
    const trytes = asciiToTrytes(JSON.stringify(packet))
    const message = Mam.create(mamState,trytes)

    // Save new mamState
    mamState = message.state

    // Attach the payload
    await Mam.attach(message.payload, message.address, 3, 9)

    // console.log('Published', packet, '\n');
    // console.log(`Root: ${message.root}\n`)
    // console.log(`Verify with MAM Explorer:\n${mamExplorerLink}${message.root}\n`)

    //Store MAM state for update later
    fs.writeFileSync('mam_state.json',JSON.stringify(mamState))
    
    return message.root
}
