/*
 * @Author: florence.pfammatter 
 * @Date: 2019-11-01 11:46:26 
 * @Last Modified by: florence.pfammatter
 * @Last Modified time: 2019-12-07 11:34:17
 * @Description: Create an identity for a packaging unit and setup the GNSS tracking channel for it, define access
 */

const uuidv4 = require('uuid/v4')
const fs = require('fs')
const Mam = require('@iota/mam')
const { asciiToTrytes } = require('@iota/converter')
const CryptoJS = require('crypto-js')

const helpers = require('./helpers')

//  let commodityGroup = 'Cameras'
//  let seriesNumber = '1510791'
//  let numberOfItems = '10'
//  let valueOfItem = '399'
//  let currencyOfPrice = 'CHF'
//  let owner = 'Sony Corporation'
//  let trackingChannel = 'KUVQAPFVUZ9FUVLGWHVHVIPVOHLGLZRYWHNEWHPYSNFSXOYPEIKDDGMCEOKZISVOSWCZ9JJMNQLFBWOQY'
//  let deliveryDate = '01/01/2020'

exports.createPackagingUnit = async data => {
    try {
        //Set up MAM GNSS tracking channel
        //Store side Key savely ------------------------------------------TBD
        let trackingKey = helpers.setupTracking()
        // console.log(trackingKey)
        
        //getTrackingRoot ------------------------------------------------TBD
        let trackingRoot = 'WWOTSUHSMXGELOPMDAHFSYXUGEHNIM'
        let claim = helpers.createClaim(data,trackingRoot)
        // console.log(claim)

        helpers.storeClaim(claim)
        
        let hashedClaim = helpers.hashClaim(claim)

        let result = 0
        await helpers.registerIdentity(hashedClaim).then(root => {
            //Send root and sideKey to transports---------------------------TBD
            result = {
                'claim': claim,
                'root': root
            }
            // console.log('Result before returning',result)
        })
        return result
    } catch(err) {
        //handle error-------------------------------------------------------TBD
        return err
    }
}