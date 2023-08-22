var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSession = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var passport = require('passport');
const mongoStore = require('connect-mongo');;
var mongoose = require("mongoose");
var app = express()

app.use(expressSession({
  secret:'shop',
  resave:false,
  saveUninitialized:true,
  cookie:{
    maxAge:(24* 60 * 60 * 1000)
  },
  store:mongoStore.create({
      // mongoUrl:'mongodb://127.0.0.1:27017/Books'
      mongoUrl:'mongodb://127.0.0.1:27017/Book-project'
  },function(err){
      console.log(err|| 'connect mongo setup ok');
  })
}));


app.use(passport.authenticate('session'));

app.use(passport.initialize())
passport.serializeUser(function(user, done) {
  done(null, user.id);
}); 
// passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(async function(id,done){
  console.log(id)
  let User = await usersRouter.findOne({_id: id})
  done(null,User)
});

// passport.serializeUser(usersRouter.serializeUser());
// passport.deserializeUser(usersRouter.deserializeUser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
