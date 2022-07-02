const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();
router.use(authController.protect);
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router
  .route('/')
  .get(bookingController.getAllBooking)
  .post(bookingController.createBooking);

router.use(authController.restrictTo('admin', 'lead-guide'));
router
  .route('/:id')
  .get(
    bookingController.getBooking,
    bookingController.deleteBooking,
    bookingController.updateBooking
  );

module.exports = router;
