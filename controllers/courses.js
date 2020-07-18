const Course = require("../models/Course");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const Bootcamp = require("../models/Bootcamp");

//@desc     Get all Courses
//@route    GET api/v1/courses
//@route    GET api/v1/bootcamps/:bootcampId/courses
//@access   public

exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res
      .status(200)
      .json({ success: true, count: courses.length, data: courses });
  } else res.status(200).json(res.advancedResults);
});

//@desc     Get Single Courses
//@route    GET api/v1/courses/:id
//@access   public

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await (await Course.findById(req.params.id)).populate({
    path: "bootcamp",
    select: "name description",
  });
  if (!course)
    return next(
      ErrorResponse(`Course not found with id of ${req.params.id}`),
      404
    );
  res.status(200).json({ success: true, data: courses });
});

//@desc     Create Single Courses
//@route    POST api/v1/bootcamps/:bootcampId/courses
//@access   public

exports.addCourse = asyncHandler(async (req, res, next) => {
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
  //Check user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
        401
      )
    );
  }

  const course = await Course.create(req.body);
  res.status(200).json({ success: true, data: courses });
});

//@desc     Update a course
//@route    PUT api/v1/bootcamps/:bootcampId/course/:id
//@access   public

exports.updateCourse = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp)
    return next(
      new ErrorResponse(
        `Bootcamp not found withid of ${req.params.bootcampId}`
      ),
      404
    );
  //Check user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update a course to bootcamp ${bootcamp._id}`,
        401
      )
    );
  }
  const course = Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!course)
    return next(
      new ErrorResponse(`Course not found with id of ${req.params.id}`),
      404
    );

  req.status(200).json({ success: true, data: courses });
});

//@desc     Delete a course
//@route    DELETE api/v1/bootcamps/:bootcampId/course/:id
//@access   public

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp)
    return next(
      new ErrorResponse(
        `Bootcamp not found withid of ${req.params.bootcampId}`
      ),
      404
    );
  //Check user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete a course to bootcamp ${bootcamp._id}`,
        401
      )
    );
  }
  const course = Course.findByIdAndDelete(req.params.id);

  if (!course)
    return next(
      new ErrorResponse(`Course not found with id of ${req.params.id}`),
      404
    );

  req.status(200).json({ success: true, data: {} });
});
