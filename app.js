// 載入 server 程式需要的相關套件
const createError = require('http-errors');
const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan')
const User = require('./models/user')
const session = require('express-session')

const home = require('./routes/home')
const user = require('./routes/user')
const admin = require('./routes/admin')
const api = require('./routes/api')


// 載入設定
const config = require('./config')

//資料庫連線
const mongoose = require('mongoose')
mongoose.set('strictQuery', false);
mongoose.connect(config.database, config.databaseSet)
    .then(() => console.log('Mongodb connected.....'))
    .catch((err) => console.log(err))
  
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 套用 middleware
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(morgan('dev'))
app.use(session({
  secret: config.specialkey,
  name: 'user', // optional
  saveUninitialized: false,
  resave: true,
  cookie: { maxAge: 600 * 100 * 60 * 3} //600 * 100 = 1分鐘到期 目前設定為3小時
}))

app.use('/', home)
app.use('/user', user)
app.use('/admin', admin)
app.use('/api', api)

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

app.listen(port, (err) => {
    if(err) {
        console.log('媽的哩 系統出事啦')
    }
    console.log(`Example app listening on port ${port} http://localhost:${port}`)
    setInterval(() => {
      User.updateMany(
        { 'day.day': { $gt: 0, $lte: 32 } },
        { $inc: { 'day.$[elem].day': -1 } },
        { arrayFilters: [{ 'elem.day': { $gt: 0, $lte: 32 } }], multi: true }
      )
        .then(result => {
          console.log(result)
        })
        .catch(err => {
          console.error(err);
        });
    }, 1000*60*60*24);//隔24小時執行一次
})