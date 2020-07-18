const mongoose = require("mongoose");
const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add title for the review"],
    maxLength: 100,
  },
  text: {
    type: String,
    required: [true, "Please add some text"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Please add a rating between 1 and 10"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

//Static method to get avg of rating
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  // console.log("Calculating average Rating....".blue);

  const obj = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    {
      $group: {
        _id: "$bootcamp",
        averageRating: { $avg: "$averageRating" },
      },
    },
  ]);

  // console.log("sandip");
  // console.log(obj);
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].rating,
    });
  } catch (err) {
    console.error(err);
  }
};

//Call getAverageRating after save
ReviewSchema.post("save", async function () {
  await this.constructor.getAverageRating(this.bootcamp);
});

//Call getAverageRating before remove
ReviewSchema.pre("remove", async function () {
  await this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model("Review", ReviewSchema);
