const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
// const findOrCreate = require("mongoose-findorcreate");
mongoose.connect("mongodb://127.0.0.1:27017/Book-project")
  .then(function (connected) {
    console.log("connected!");
  })
  .catch((err) => {
    console.log(err);
  });

let userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      require: true,
    },
    books:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"book"
     }],
     carts:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"book"
     }],
     wishlist:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"book"
     }],
     Myorders:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"order"
     }],
     Mysellingorders:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"order"
     }],
    name: {
      type: String,
      // require: true,
    },
    lastname:{
      type: String,
    },
    userProfileimg: String,
    contactnumber: Number,
    token: {
      type: String,
      default: "",
    },
    expiringTime: String,
    password: String,
    // Admin:{ type: Boolean, default: false },
    City:String,
    countyr:String,
    State:String,
    Zipcode:Number,
    Address:String
  },
  { timestamps: true }
);
userSchema.plugin(plm, { usernameField: "email" });
// userSchema.plugin(findOrCreate);
module.exports = mongoose.model("user", userSchema);



// const mongoose = require("mongoose");
// const plm = require("passport-local-mongoose");
// mongoose.connect("mongodb://127.0.0.1:27017/Books")
//   .then(function (connected) {
//     console.log("connected!");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// let userSchema = mongoose.Schema({
//     username: { type: String },
   
//   { timestamps: true }
// );

// // // Disable the password requirement by setting passwordField to false
// // userSchema.plugin(plm, { passwordField: false });


// userSchema.plugin(plm, { usernameField: "email" });
// // userSchema.plugin(findOrCreate);
// module.exports = mongoose.model("user", userSchema);