// MongoDB schema for review collection
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  propertyId: {
    type: String,
    required: true,
  },
  reviewerName: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
