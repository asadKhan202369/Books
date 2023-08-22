const crypto = require('crypto')
const path = require('path')
const multer = require('multer')



const userimagesstorage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, './public/images/uploads/userimages')
    },
    filename:function(req, file, cb){
        crypto.randomBytes(14, function(err, buff){
            let fnn = buff.toString('hex')+path.extname(file.originalname);
            cb(null, fnn)
        })
    }
})


const bookStorage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, './public/images/uploads/bookimages')
    },
    filename:function(req, file, cb){
        crypto.randomBytes(14, function(err, buff){
            let fnn = buff.toString('hex')+path.extname(file.originalname);
            cb(null, fnn)
        })
    }
})


const vehicleeditsstorage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, './public/images/uploads/vehicleimages')
    },
    filename:function(req, file, cb){
        crypto.randomBytes(14, function(err, buff){
            let fnn = buff.toString('hex')+path.extname(file.originalname);
            cb(null, fnn)
        })
    }
})


module.exports = {userimagesstorage, bookStorage}