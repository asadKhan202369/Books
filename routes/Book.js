var mongoose = require('mongoose');

var bookSchema = mongoose.Schema({
     ownerId:{
          type: mongoose.Schema.Types.ObjectId, 
          ref:"user"
     },
     bookingId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref:"user"
    },
     BookName:String,
     BookType:String,
     BookCatagory:String, //ye is type se schema me book catagory field deo
     Title:String,
     BookCondition:String,
     pic:{
        type:Array,
        default:[]
     },  
     Price:Number,
     // Shipping:String,
     Shipping: Number,
     PaymentMode:String,
     mrp:String,
     author:String,
     Des:String,
     edition:String
     
},{timestamps:true,})

module.exports = mongoose.model("book", bookSchema);
