const uuidv4 = require('uuid/v4')
const fs = require('fs')
const Mam = require('@iota/mam')
const { asciiToTrytes } = require('@iota/converter')
const CryptoJS = require('crypto-js')
const shelljs = require('shelljs')

//Create MAM GNSS channel
exports.setupTracking = () => {
    let mode = 'restricted'
    //Attention this sideKey is pseudo-random and not unique, for production mode use true random generator hardware or API
    let key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    let provider = 'https://nodes.devnet.iota.org'
    let seed = 'ZOEB9BJXYXUNYC9BJDNYJVKWPUDZFZHVMY9OLD9NKCVOUS9BSXHZNIUYYITMRDITKJJSAZPHCIOWXSBQN'

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
     if (shelljs.exec('pm2 start tracking.js --name="tracking.js" --update-env').code !== 0) { //if code is not equal 0, process could not be started
	   console.log('process could not be started')
            return false
        } else {
            return true
        }
}

//Stop tracking
exports.stopTracking = () => {
    if(shelljs.exec('pm2 pid tracking.js') !== null) { //if result is not null, process does exist, so it can be deleted
        if (shelljs.exec('pm2 delete tracking.js').code !== 0) { //if exit code is not 0, deletion failed
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
