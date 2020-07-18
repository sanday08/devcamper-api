const Review = require("../models/Review");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const Bootcamp = require("../models/Bootcamp");

//@desc     Get all Reviews
//@route    GET api/v1/reviews
//@route    GET api/v1/bootcamps/:bootcampId/reviews
//@access   public

exports.getReviews = asyncHandler(async (req, res, next) => {
  let query;
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    return res
      .status(200)
      .json({ success: true, count: reviews.length, data: reviews });
  } else res.status(200).json(res.advancedResults);
});

//@desc     Get Single Reviews
//@route    GET api/v1/reviews/:id
//@access   public

exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await (await Review.findById(req.params.id)).populated({
    path: "bootcamp",
    select: "name description",
  });
  if (!review) {
    next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: reviews });
});

//@desc     Add Reviews
//@route    POST api/v1/reviews
//@access   Private

exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp)
    return next(
      new ErrorResponse(
        `Bootcamp not found with id of ${req.params.bootcampId}`,
        404
      )
    );

  const review = await Review.create(req.body);
  res.status(201).json({ success: true, data: review });
});

//@desc     Update Reviews
//@route    PUT api/v1/reviews/:id
//@access   Private

exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await review.findById(req.params.id);
  if (!review) {
    return next(
      new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
    );
  }

  //make sure review belongs to user or admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }
  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({ success: true, data: review });
});

//@desc     Delete Reviews
//@route    DELETE api/v1/reviews/:id
//@access   Private

exports.deleteReview = asyncHandler(async (req, res, next) => {
  let review = await review.findById(req.params.id);
  if (!review) {
    return next(
      new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
    );
  }

  //make sure review belongs to user or admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to delete review`, 401));
  }
  review = await Review.findByIdAndDelete(req.params.id);
  res.status(201).json({ success: true, data: review });
});
