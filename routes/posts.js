const { name } = require("ejs");
const mongoose = require("mongoose");
const blogCategory = require("./blogCategories");
const author = require("./author");


const postSchema = mongoose.Schema({
  author: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: "author"
  },
  title: String,
  slug: String,
  content: String,
  excerpt: { type: String },
  category: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "blogCategories"
  }],
  tag : [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "tag"
  }],
  coverImage: String,
  altText: String,
  metaTitle: String,
  metaDescription: String,
  metaKeywords: String,
  ogTitle: String,
  ogType: String,
  ogUrl: String,
  ogImage: String,
  ogDescription: String,
  twitterCard: String,
  twitterUrl: String,
  twitterTitle: String,
  twitterDescription: String,
  twitterImage: String,
  status: { type: String, enum: ['draft', 'publish'], default: 'draft' }, // New field for post status
},{ timestamps: true });

postSchema.methods.formatCreatedAt = function() {
  const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric' 
  };
  return this.createdAt.toLocaleString('en-US', options);
};

postSchema.index({ title: 'text', content: 'text' });

// const postModel = mongoose.model('Post', postSchema);



module.exports = mongoose.model("post", postSchema);