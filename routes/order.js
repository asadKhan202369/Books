var mongoose = require('mongoose');

var orderSchema = mongoose.Schema({
     ownerId:{
          type: mongoose.Schema.Types.ObjectId, 
          ref:"user"
     },
     sellerId:[{
          type: mongoose.Schema.Types.ObjectId, 
          ref:"user"
     }],
     bookId:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref:"book"
    }],
     fullName:String,
     contact:String,
     pin:String,
     locality:String,  
     Address:String,
     AddressType:String,
     landmark:String,
     alternatePhone:String,

},{timestamps:true,})

module.exports = mongoose.model("order", orderSchema);
