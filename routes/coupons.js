const { name } = require("ejs");
const mongoose = require("mongoose");
const brand = require("./brands");


const couponSchema = new mongoose.Schema({
  title: { type: String, required: true },
  affiliateURL: { type: String},
  targetUrl: { type: String},
  discountCode: { type: String },
  dynamicContent: String,
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'brand', required: true },
  freeShipping: { type: Boolean, default: false },
  bestCoupon: { type: Boolean, default: false },
  exclusive: { type: Boolean, default: false },
  available: { type: Boolean, default: true },
  expiry: { type: Date, required: true },
  description: String
}, { timestamps: true });

couponSchema.methods.formatCreatedAt = function() {
  const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric' 
  };
  return this.createdAt.toLocaleString('en-US', options);
};



// const postModel = mongoose.model('Post', postSchema);



module.exports = mongoose.model("coupon", couponSchema);