const express = require('express')
const router = express.Router()
const ctrl = require('./crop-ctrl')

router.get('/', ctrl.cropImage)

module.exports = router