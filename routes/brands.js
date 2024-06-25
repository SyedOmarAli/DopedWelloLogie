const { name } = require("ejs");
const mongoose = require("mongoose");
const coupon = require("./coupons");
const brandCategories = require("./brandCategories");


const brandSchema = mongoose.Schema({
    name: { type: String, required: true },
    titleSuffix: { type: String },
    identifier: { type: String, unique: true, required: true },
    coupon: [{type: mongoose.Schema.Types.ObjectId, ref: 'coupon', required: true}],
    affiliateURL: { type: String },
    categories: [{ type: mongoose.Schema.Types.ObjectId,
      ref: "brandCategories"}],
    image: { type: String },
    redirection: { type: String },
    brandDynamicContent: { type: String },
    metaTitle: { type: String },
    metaKeywords: { type: String },
    metaDescription: { type: String },
    offersTableHeading: { type: String },
    aboutSectionHeading: { type: String },
    sidebarDescription: { type: String },
    description: { type: String },
    rating: { type: Number, min: 0, max: 5 },
    ratingCount: { type: Number }
  }, {
    timestamps: true
  });

brandSchema.methods.formatCreatedAt = function() {
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



module.exports = mongoose.model("brand", brandSchema);