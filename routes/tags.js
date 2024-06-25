const { name } = require("ejs");
const mongoose = require("mongoose");
const posts = require("./posts");




const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "post"
      }],
    Slug: {
        type: String
    }
});

module.exports = mongoose.model("tag", tagSchema);