const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const Bookings = require('../models/bookingModel');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking') {
    res.locals.alert =
      'Your booking was successful! check your email for confirmation, if it does not! please wait a little ';
  }
  next();
};
exports.getOverview = async (req, res, next) => {
  try {
    //get tour data from collection
    const tours = await Tour.find();

    //build template

    //3 render that template using data from 1
    res.status(200).render('overview', {
      title: 'All Tours',
      tours,
    });
  } catch (err) {
    next(new Error('something wrong with the getOverView function'));
  }
};

exports.getTourView = async (req, res, next) => {
  try {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user',
    });
    res.status(200).render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
  } catch (err) {
    return res.status(404).render('error', {
      title: 'Something went very very wrong!',
      msg: err.message,
    });
  }
};

exports.getLogin = (req, res, next) => {
  try {
    res.status(200).render('login', {
      title: 'log in!',
    });
  } catch (err) {
    next(new Error('something wrong with the getLogin view function'));
  }
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'your account',
  });
};

exports.getMyTours = async (req, res) => {
  try {
    const bookings = await Bookings.find({ user: req.user.id });
    const tourIDs = bookings.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });
    res.status(200).render('overview', {
      title: 'My Tours',
      tours,
    });
  } catch (err) {
    console.log(err);
  }
};
