const { name } = require("ejs");
const mongoose = require("mongoose");
const brands = require("./brands");




const brandCategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    brands: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "brands"
      }],
      categoryType: { type: String, default: 'general' }, // Distinguish category type,
    suffix: {
        type: String
    },
    slug: {
        type: String
    }
});

module.exports = mongoose.model("brandCategories", brandCategorySchema);