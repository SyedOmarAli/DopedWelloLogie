const { name } = require("ejs");
const mongoose = require("mongoose");
const posts = require("./posts");




const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "post"
      }],
    slug: {
        type: String
    }
});

module.exports = mongoose.model("author", authorSchema);