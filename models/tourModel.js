const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel'); only for embedding

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'max 40 characters hehe'],
      minlength: [5, 'must be more than 4 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'all tours must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
      },
      message: 'only easy, medium or difficult',
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'must be above 1'],
      max: [5, 'must be below 5'],
      set: (val) => Math.round(val * 10) / 10, // round the ratings
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: {
      type: Number,
      // no work in updates, only when creating a new document.
      // validate: {
      //   function() {
      //     return val < this.price;
      //   },
      //   message: 'discount price is fucked up bro wtf are you doing omg nigga',
      // },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'all tours must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    rating: { type: Number, default: 4.5 },
    price: { type: Number, required: [true, 'tour must have a pice'] },
    imageCover: {
      type: String,
      required: true,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GEOJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], //longitude and then latitude
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array, //embedding
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 }); //-1 descending order
tourSchema.index({ slug: 1 }); //makes it possible to allow db to query for data faster.
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('reviews', {
  ref: 'reviewModel',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.virtual('durationWeeks').get(function () {
  // doesn't exit on the data base
  return this.duration / 7;
});

// tourSchema.pre('save', async function (next) { //embedding
//   //embedding
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });
//DOCUMENT MIDDLEWARE runs before the save() and create() command
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('will save document...');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE

tourSchema.pre(/^find/, function (next) {
  //points at the query and not the document
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();

  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    //filters the data is shown
    path: 'guides',
    select: '-__v -passwordChangedAt',
  }); //for referencing (populate jaja omg)

  next();
});
tourSchema.post(/^find/, function (docs, next) {
  console.log(`query took ${Date.now() - this.start} miliseconds`);
  next();
});

// aggregation middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { ne: true } } });
//   console.log(this.pipeline());

//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
