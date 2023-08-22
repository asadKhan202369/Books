var express = require("express");
var router = express.Router();
var passport = require("passport");
var mongoose = require("mongoose");
const localStrategy = require("passport-local");
const crypto = require("crypto");
const userModel = require("./users");
const orderModel = require("./order");
const mailer = require("../nodemailer");
const bookModel = require("./Book");
const configm = require("../config/config");
const multer = require("multer");
// var Razorpay = require("razorpay");
const Razorpay = require("razorpay");

const bookimagesupload = multer({ storage: configm.bookStorage });
const userimagesupload = multer({ storage: configm.userimagesstorage });

//  razorpay poayment

//razorpay instance
var instance = new Razorpay({
  key_id: "rzp_test_e0p4ROsVzyQ7xL",
  key_secret: "DwGCKSi05b7yDJc6VijYVM6Y",
});

router.get("/success", function (req, res) {
  res.render("success");
});

router.post("/create/orderId", async function (req, res) {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("carts");
  console.log(user.carts.length, "uts length");
  var total_amount = 0;
  var pcost = 0;
  var scost = 0;
  user.carts.forEach(function (cart) {
    pcost += cart.Price;
    scost += cart.Shipping;
  });
  total_amount = (pcost + scost) * 100;
  var options = {
    amount: total_amount, // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11",
  };
  instance.orders.create(options, function (err, order) {
    console.log(order);
    res.send(order);
  });
});

router.post("/api/payment/verify", (req, res) => {
  let body =
    req.body.response.razorpay_order_id +
    "|" +
    req.body.response.razorpay_payment_id;

  var crypto = require("crypto");
  var expectedSignature = crypto
    .createHmac("sha256", "DwGCKSi05b7yDJc6VijYVM6Y")
    .update(body.toString())
    .digest("hex");
  console.log("sig received ", req.body.response.razorpay_signature);
  console.log("sig generated ", expectedSignature);
  var response = { signatureIsValid: "false" };
  if (expectedSignature === req.body.response.razorpay_signature)
    response = { signatureIsValid: "true" };
  res.send(response);
});

//  razorpay poayment

/* GET home page. */

router.get("/", async function (req, res, next) {
  if (req.isAuthenticated()) {
    let user = await userModel.findOne({ email: req.user.email });
    res.render("home", { user: user });
  } else {
    res.render("home", { user: null });
  }
});

passport.use(
  new localStrategy(
    {
      usernameField: "email",
      usernameQueryFields: ["email"],
      passwordField: false,
    },

    userModel.authenticate()
  )
);

// googlee authenticate

const GoogleStrategy = require("passport-google-oidc");
const { config } = require("dotenv");
const order = require("./order");
const { error } = require("console");
const _ = require("passport-local-mongoose");

require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      callbackURL: "/oauth2/redirect/google",
      scope: ["email", "profile"],
    },
    async function verify(issuer, profile, cb) {
      console.log(profile);
      let user = await userModel.findOne({ email: profile.emails[0].value });
      if (user) {
        return cb(null, user);
      } else {
        let newUser = await userModel.create({
          name: profile.displayName,
          email: profile.emails[0].value,
        });
        newUser.save();
        return cb(null, newUser);
      }
    }
  )
);

router.get("/login/federated/google", passport.authenticate("google"));

router.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

// googlee authenticate

router.post("/create/book",
  isLoggedIn,
  bookimagesupload.array("vehiclephoto", 5),
  async function (req, res) {
    const loginuser = await userModel.findOne({ email: req.user.email });
    let createBook = await bookModel.create({
      ownerId: loginuser._id,
      BookName: req.body.bookName,
      Title: req.body.title,
      BookType: req.body.bookType,
      BookCatagory: req.body.bookC,
      BookCondition: req.body.bookCon,
      Price: req.body.bookPrice,
      Shipping: req.body.shipping,
      PaymentMode: req.body.pay,
      mrp: req.body.mrp,
      author: req.body.author,
      Des: req.body.Des,
      edition: req.body.edition,
      pic: req.files.map((pic) => pic.filename),
    });
    loginuser.books.push(createBook);
    await loginuser.save();
    res.redirect("/");
  }
);

router.get("/deleteadd/:id", isLoggedIn, async function (req, res) {
  var id = req.params.id;
  let user = await userModel.findOne({ email: req.user.email });
  var index = user.books.indexOf(req.params.id);
  let deletebook = await bookModel.findOneAndDelete({ _id: req.params.id });
  user.books.splice(index, 1);
  user.save();
  res.redirect("back");
});

router.get("/editad/:id", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });
  let book = await bookModel.findOne({ _id: req.params.id });
  res.render("editbook", { book, user });
});


router.post("/updatebook/:id", isLoggedIn, async function (req, res) {
  bookModel
    .findOneAndUpdate(
      { _id: req.params.id },
      {
        
        BookName: req.body.bookName,
        Title: req.body.title,
        Price: req.body.bookPrice,
        Shipping: req.body.shipping,
        mrp: req.body.mrp,
        author: req.body.author,
        Des: req.body.Des,
        edition: req.body.edition,
      }
    )
    .then(function () {
      res.redirect("/Myads");
    });
});

router.get("/oldbooks", async function (req, res) {
  if (req.isAuthenticated()) {
    let user = await userModel.findOne({ email: req.user.email });
    // let books = await bookModel.find({BookCondition: 'New'});
    const books = await bookModel
      .find({ BookCondition: { $not: { $eq: "New" } } })
      .populate({
        path: "ownerId",
        populate: {
          path: "Mysellingorders",
        },
      });
    res.render("oldbooks1", { user: user, books: books });
  } else {
    // const books = await bookModel.find({ bookcategory: { $ne: 'new' } });
    const books = await bookModel
      .find({ bookcategory: { $not: { $eq: "new" } } })
      .populate({
        path: "ownerId",
        populate: {
          path: "Mysellingorders",
        },
      });
    res.render("oldbooks1", { user: null, books: books });
  }
});

// update user.

router.post("/update", function (req, res) {
  userModel
    .findOneAndUpdate(
      { email: req.user.email },
      {
        name: req.body.firstname,
        lastname: req.body.lastame,
        contactnumber: req.body.Phonenumber,
        email: req.body.email,
        Zipcode: req.body.Pincode,
        Address: req.body.Address,
        // password:req.body.password
      }
    )
    .then(function (user) {
      console.log("user uodated", user);
      res.redirect("/profile");
    });
});

// update user

// update Address.

router.post("/updateadd/:id", async function (req, res) {
  // console.log(req.params.id);
  orderModel
    .findOneAndUpdate(
      { _id: req.params.id },
      {
        fullName: req.body.fname,
        contact: req.body.mob,
        pin: req.body.pinc,
        locality: req.body.loc,
        Address: req.body.Add,
        AddressType: req.body.Addt,
        landmark: req.body.Lmark,
        alternatePhone: req.body.aplhone,
      }
    )
    .then(function () {
      res.redirect("back");
    });
});

// update Address.

router.get("/Myads", isLoggedIn, async function (req, res) {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("books");
  res.render("Myads", { user: user });
});

router.get("/Mysell", isLoggedIn, async function (req, res) {
  // let user = await userModel.findOne({email:req.user.email}).populate('Mysellingorders')
  let user = await userModel.findOne({ email: req.user.email }).populate({
    path: "Mysellingorders",
    populate: {
      path: "bookId",
      populate: {
        path: "ownerId",
      },
    },
  });
  const uniqueSellingArray = [...new Set(user.Mysellingorders)];
  const arr = uniqueSellingArray;
  user.save();
  res.render("Mysell", { user: user, arr: arr });
});

router.get("/Myorders", isLoggedIn, async function (req, res) {
  // let user = await userModel.findOne({email:req.user.email}).populate('Myorders')
  let user = await userModel.findOne({ email: req.user.email }).populate({
    path: "Myorders",
    populate: {
      path: "bookId",
      populate: {
        path: "ownerId",
      },
    },
  });
  res.render("Myorders", { user: user });
});

router.get("/wishlist", isLoggedIn, async function (req, res) {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("wishlist");
  res.render("wishlist", { user: user });
});

router.get("/book/:id", async function (req, res) {
  if (req.isAuthenticated()) {
    let user = await userModel.findOne({ email: req.user.email });
    let book = await bookModel
      .findOne({ _id: req.params.id })
      .populate("ownerId");
    res.render("book", { user: user, book: book });
  } else {
    let book = await bookModel
      .findOne({ _id: req.params.id })
      .populate("ownerId");
    res.render("book", { user: null, book: book });
  }
});

router.get("/mybook/:id", async function (req, res) {
    let user = await userModel.findOne({ email: req.user.email });
    let book = await bookModel
      .findOne({ _id: req.params.id })
      .populate("ownerId");
    res.render("mybook", { user: user, book: book });
});

router.post("/checkout", async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email }).populate({
      path: "carts",
      populate: {
        path: "ownerId",
      },
    });
    const order = await orderModel.create({
      fullName: req.body.fname,
      contact: req.body.mob,
      pin: req.body.pinc,
      locality: req.body.loc,
      Address: req.body.Add,
      AddressType: req.body.Addt,
      landmark: req.body.Lmark,
      alternatePhone: req.body.aplhone,
      bookId: user.carts.map((pic) => pic._id),
      sellerId: user.carts.map((pic) => pic.ownerId._id),
    });
    user.carts.forEach(async function (eml) {
      let seller = await userModel.findOne({ _id: eml.ownerId._id });
      const orderExists = seller.Mysellingorders.includes(order);
      if (!orderExists) {
        seller.Mysellingorders.push(order);
        await seller.save();
      }
    });
    user.Myorders.push(order);
    user.carts = [];
    await user.save();
    // res.redirect("back")
    res.render("checkout", { user: user, order: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});
// let user = await userModel.findOne({email:req.user.email})

router.get("/allbooks", async function (req, res) {
  if (req.isAuthenticated()) {
    let user = await userModel.findOne({ email: req.user.email });
    let allbooks = await bookModel.find().populate({
      path: "ownerId",
      populate: {
        path: "Mysellingorders",
      },
    });
    res.render("allbooks", { user: user, allbooks: allbooks });
  } else {
    // let allbooks = await bookModel.find();
    // let allbooks = await bookModel.find().populate('ownerId')
    let allbooks = await bookModel.find().populate({
      path: "ownerId",
      populate: {
        path: "Mysellingorders",
      },
    });
    res.render("allbooks", { user: null, allbooks: allbooks });
  }
});

router.get("/addwishlist/:id", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });
  if (user.carts.indexOf(req.params.id) === -1) {
    user.wishlist.push(req.params.id);
    await user.save();
    res.redirect("back");
  } else {
    var index = user.carts.indexOf(req.params.id);
    user.carts.splice(index, 1);
    user.wishlist.push(req.params.id);
    await user.save();
    res.redirect("back");
  }
});

router.get("/removewishlist/:id", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });
  var index = user.wishlist.indexOf(req.params.id);
  user.wishlist.splice(index, 1);
  await user.save();
  res.redirect("back");
});

router.get("/addcart/:id", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });
  var index = user.wishlist.indexOf(req.params.id);
  if (user.wishlist.indexOf(req.params.id) === -1) {
    user.carts.push(req.params.id);
    await user.save();
    res.redirect("back");
  } else {
    user.wishlist.splice(index, 1);
    user.carts.push(req.params.id);
    await user.save();
    res.redirect("back");
  }
});

router.get("/cart", async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email }).populate({
    path: "carts",
    populate: {
      path: "ownerId",
    },
  });
  res.render("cart", { user: user });
});

router.get("/removecart/:id", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });
  var index = user.carts.indexOf(req.params.id);
  user.carts.splice(index, 1);
  await user.save();

  res.redirect("back");
});

router.get("/post-ad", isLoggedIn, async function (req, res, next) {
  let user = await userModel.findOne({ email: req.user.email });
  res.render("post-ad", { user: user });
});

router.get("/newbooks", async function (req, res) {
  if (req.isAuthenticated()) {
    try {
      let user = await userModel.findOne({ email: req.user.email });
      let newbooks = await bookModel.find({ BookCondition: "New" });
      // let newbooks = await bookModel.find({BookCondition: 'New'});
      res.render("newbooks", { user: user, newbooks: newbooks });
    } catch (err) {
      console.error("Error fetching new books:", err);
      res.status(500).send("Error fetching new books.");
    }
  } else {
    try {
      let newbooks = await bookModel.find({ BookCondition: "New" });
      res.render("newbooks", { user: null, newbooks:  null });
    } catch (err) {
      console.error("Error fetching new books:", err);
      res.status(500).send("Error fetching new books.");
    }
  }
});

router.get("/catagory/:name", async function (req, res) {
  if (req.isAuthenticated()) {
    try {
      const searchQuery = req.query.name;
      const decodedCategory = decodeURIComponent(req.params.name);
      let user = await userModel.findOne({ email: req.user.email });
      // let books = await bookModel.find({BookCatagory:decodedCategory});
      let books = await bookModel.find({
        $or: [{ BookCatagory: decodedCategory }, { BookType: decodedCategory }],
      });

      // let newbooks = await bookModel.find({BookCondition: 'New'});
      res.render("catagory", {
        user: user,
        books: books,
        decodedCategory: decodedCategory,
      });
    } catch (err) {
      console.error("Error fetching new books:", err);
      res.status(500).send("Error fetching new books.");
    }
  } else {
    try {
      const decodedCategory = decodeURIComponent(req.params.name);
      let books = await bookModel.find({ BookCatagory: decodedCategory });
      // let newbooks = await bookModel.find({BookCondition: 'New'});
      res.render("catagory", {
        user: null,
        books: books,
        decodedCategory: decodedCategory,
      });
    } catch (err) {
      console.error("Error fetching new books:", err);
      res.status(500).send("Error fetching new books.");
    }
  }
});

router.post("/register", function (req, res) {
  var userdata = new userModel({
    name: req.body.name,
    email: req.body.email,
    contactnumber: req.body.phoneNumber,
  });
  userModel.register(userdata, req.body.password).then(function (u) {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  }),
  function (req, res) {}
);

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  }),
  function (req, res) {}
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.clearCookie("connect.sid");
    delete req.session;
    res.redirect("/");
  });
});

router.get("/profile", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });
  res.render("profile", { user: user });
});

// /update photu/

router.post(
  "/uploadphotu",
  isLoggedIn,
  userimagesupload.single("filenames"),
  async function (req, res) {
    let user = await userModel.findOne({ email: req.user.email });
    user.userProfileimg = req.file.filename;
    user.save();
    res.redirect("back");
  }
);

// update photu

// / route

router.get("/login", function (req, res) {
  res.render("logint", { user: null });
});

router.get("/sign", function (req, res) {
  res.render("signt", { user: null });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

function isLoggedout(req, res, next) {
  if (req) {
    res.redirect("/home");
  } else {
    return next();
  }
}

// forgot pass

router.get("/forgot", function (req, res) {
  res.render("forgot");
});

router.post("/forgot", async function (req, res) {
  let user = await userModel.findOne({ email: req.body.email });
  if (user) {
    crypto.randomBytes(17, async function (err, buff) {
      var rnstr = buff.toString("hex");
      (user.token = rnstr), (user.expiringTime = Date.now() + 3000000);
      await user.save();
      mailer(req.body.email, user._id, user.name, rnstr).then(function () {
        console.log("send mail!");
      });
    });
  } else {
    res.send("no account!");
  }
});

router.get("/reset/:userid/:token", async function (req, res) {
  let user = await userModel.findOne({ _id: req.params.userid });

  if (user.token === req.params.token && user.expiringTime > Date.now()) {
    res.render("newpass", { id: req.params.userid });
  } else {
    res.send("link expired!");
  }
});

router.post("/reset/:id", async function (req, res) {
  let user = await userModel.findOne({ _id: req.params.id });
  user.setPassword(req.body.newpassword, async function () {
    user.otp = "";
    await user.save();
    res.redirect("/profile");
  });
});

// forgot pass

router.post("/register", function (req, res) {
  var userdata = new userModel({
    name: req.body.name,
    email: req.body.email,
    contactnumber: req.body.phoneNumber,
  });
  userModel.register(userdata, req.body.password).then(function (u) {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  }),
  function (req, res) {}
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.clearCookie("connect.sid");
    delete req.session;
    res.redirect("/");
  });
});

router.get("/books/:name", async function (req, res) {

  var vb = req.params.name;
      if (req.isAuthenticated()) {
        let user = await userModel.findOne({email:req.user.email})
        let book = await bookModel.find({BookType:req.params.name})
        res.render('result',{user:user,book:book,vb:vb});
  } else {
    let book = await bookModel.find({BookType:req.params.name})
    res.render('result',{user:null,book:book,vb:vb});
  }
});

router.get("/search/:value", async function (req, res) {
  const regex = new RegExp(req.params.value, "i");
  const users = await bookModel.find({
    $or: [
      { BookName: regex },
      { BookCondition: regex },
      { BookType: regex },
      { BookCatagory: regex },
      { author: regex },
      { edition: regex },
    ],
  });
  res.json({ avail: users });
});

module.exports = router;
