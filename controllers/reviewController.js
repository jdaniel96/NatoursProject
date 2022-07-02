const reviewModel = require('../models/reviewModel');
const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.getAllReviews = async (req, res, next) => {
  try {
    let filter = {};

    if (req.params.tourId) filter = { tour: req.params.tourId };
    const reviews = await Review.find(filter);

    res.status(200).json({
      status: 'omg I did it this comes from get all reviews',
      data: {
        reviews: reviews,
      },
    });
  } catch (err) {
    next(new Error('something is wrong in the getAllReviews function'));
  }
};

// exports.getSpecificReview = async (req, res, next) => {
//   try {
//     const review = await Review.findById(req.params.id);

//     res.status(200).json({
//       status: 'omg all is good this comes from getSpecificReview',
//       data: {
//         reviews: review,
//       },
//     });
//   } catch (err) {
//     next(new Error('something is wrong in the getSpecificReview function'));
//   }
// };

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.tour) req.body.user = req.user.id;
  next();
};
exports.getAllReviews = factory.getAll(reviewModel);
exports.getReview = factory.getOne(reviewModel);
exports.createReview = factory.createOne(reviewModel);
exports.updateReview = factory.updateOne(reviewModel);
exports.deleteReview = factory.deleteOne(reviewModel);
