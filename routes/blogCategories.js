const { name } = require("ejs");
const mongoose = require("mongoose");
const posts = require("./posts");




const blogCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "post"
      }],
      categoryType: { type: String, default: 'blog' }, // Distinguish category type,
    suffix: {
        type: String
    },
    slug: {
        type: String
    }
});

module.exports = mongoose.model("blogCategories", blogCategorySchema);