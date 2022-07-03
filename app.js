const express = require('express');
const app = express();
const AppError = require('./utils/appError');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const viewRouter = require('./routes/viewRoutes');
const cors = require('cors');
const cookieparser = require('cookie-parser');
const compression = require('compression');

app.enable('trust proxy');
app.use(cors());
app.options('*', cors());
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views')); //must be like this
app.use(express.static(path.join(__dirname, 'public')));
///////////////  middlewares    //////////////
// app.use(helmet({ contentSecurityPolicy: false })); //security for http omg whatever
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  //limit of request to our api per IP
  //how many request per time you want to accept
  max: 100, //quantity of request
  windowMs: 60 * 60 * 1000, //time of the request
  message: 'Too many request my nigga omg wtf',
});
app.use('/api', limiter);
//body parser
app.use(
  express.json({
    limit: '100kb',
  })
);
//cookieparser
app.use(cookieparser());

//data sanitization against NoSQL query injection
app.use(mongoSanitize());

//data sanitization against XSS attacks
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: ['duration'],
  })
); //permits other parameters not to be blocked in the whitelist

app.use(compression());
// app.use(express.static(path.join(__dirname, 'public'))); //serving static files from folder and not form api

// app.use((req, res, next) => {
//   console.log('this is a middleware');
//   next();
// });

//route + http method
// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'hello from the server side hehe', name: 'Juan Daniel' });
// });

// app.post('/', (req, res) => {
//   res.send('you can post hehe');
// });

///////////////////////////PUG ROUTES TO DISPLAY STATIC PAGE ///////////////////////

///////////////////////////PUG ROUTES TO DISPLAY STATIC PAGE ///////////////////////

// app.use((req, res, next) => { //useful when developing
//   // console.log(req.headers);
//   console.log('aqui es');
//   console.log(req);
//   next();
// });

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

// router for handle not found
app.all('*', (req, res, next) => {
  // should always be the last middleware,
  // res.status(404).json({
  //   status: 'failed',
  //   message: `can't find ${req.originalUrl} on this server`,
  // });

  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

//middleware to handle global error
app.use((err, req, res, next) => {
  // can be in another file with controller.
  // console.log(err.stack); //shows you where the error happened.
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error manin';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
