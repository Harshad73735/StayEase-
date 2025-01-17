const Review = require("../models/review.js");
const Listing = require("../models/listing.js");


module.exports.createreview=async (req, res) => {

    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);
    newReview.author=req.user._id;

    listing.review.push(newReview);
   await newReview.save();
   console.log(newReview);
  await listing.save();
  req.flash("success","New review created");
  console.log("New review saved");
  res.redirect(`/listing/${listing._id}`);
};

module.exports.destroyReview=async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { review: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success","review deleted");

  res.redirect(`/listing/${id}`);
};