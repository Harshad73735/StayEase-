const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { reviewSchema } = require("../schema.js");
const {validateReview,
       isLoggedIn,
       isReviewAuthor
      }=require("../middleware.js")

      const  reviewControlller=require("../controller/review.js");


// Add a new review
router.post("/",
  isLoggedIn,
   validateReview, 
   wrapAsync(reviewControlller.createreview));

// Delete a review
router.delete("/:reviewId",
   isLoggedIn,
   isReviewAuthor,
   wrapAsync(reviewControlller.destroyReview));

module.exports = router;
