# IOTA-Raspberry-API
NodeJS REST API to authenticate a device and to track objects by publishing positioning data to the IOTA tangle.
You can use this repo together with my other repository tracking_app. 

:warning: This API was written by a beginner. 

## Table of Contents

- [Getting started](#getting-started)
- [API functions](#api-functions)
- [Support](#support)
- [Contributing](#contributing)
- [Credits](#credits)

## Getting started

Prerequisites

- Raspberry Pi (I used the model 3B+) with internet connection
- GNSS-Module [SAM-M8Q](https://www.u-blox.com/en/product/sam-m8q-module) from u-blox
- [NodeJS](https://nodejs.org/en/) installed on your Raspi

Installation

You can download this repo and then run ```sh npm install``` to install all dependencies automatically. 
npm-modules (dependencies are also visible in package.json-file):
- @iota/mam v.0.7.3
- cors v.2.8.5
- crypto-js v.3.1.9-1
- express v.4.17.1
- gps v.0.5.3
- jsonwebtoken v.8.5.1
- serialport v.0.8.3
- uuid v.3.3.3

To install a npm module run ```sh npm install module_name```.

To connect your GNSS-module SAM-M8Q you can use a UART-connection:

![SAM-M8Q Pins](https://cdn.getfpv.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/g/p/gps-sam-m8q-2-2jpg.jpg)

Check [this tutorial](https://medium.com/@DefCon_007/using-a-gps-module-neo-7m-with-raspberry-pi-3-45100bc0bb41) to see how GPS-data from the serial port can be viewed on the Raspberry Pi.

## API functions

These API-functions are currently available:

- authenticate 
- startTracking
- stopTracking

## Support

Please [open an issue](https://github.com/flooji/IOTA-Raspberry-API/issues/new) for support.

## Contributing

Please contribute using [Github Flow](https://guides.github.com/introduction/flow/). Create a branch, add commits, and [open a pull request](https://github.com/flooji/IOTA-Raspberry-API/compare/).

## Credits

Credits to the IOTA foundation whose [tutorials](https://docs.iota.org/docs/client-libraries/0.1/mam/js/create-restricted-channel) helped me to realize this project.
