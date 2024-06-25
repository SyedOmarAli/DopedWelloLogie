var express = require("express");
var router = express.Router();
const authorModel = require("./author");
const blogCategoryModel = require("./blogCategories");
const brandCategoryModel = require("./brandCategories");
const tagModel = require("./tags");
const postModel = require("./posts"); // Import postModel here
const brandModel = require("./brands");
const couponModel = require("./coupons");
const crypto = require('crypto'); // For generating a unique parameter
const slugify = require("slugify");
const upload = require("./multer");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/admin/dashboard", function (req, res, next) {
  res.render("admin/dashboard");
});

router.get("/admin/blog", async function (req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1; // Get the current page from query parameter, default is 1
    const limit = 10; // Number of posts per page
    const skip = (page - 1) * limit; // Number of posts to skip

    const totalPosts = await postModel.countDocuments(); // Get the total number of posts
    const totalPages = Math.ceil(totalPosts / limit); // Calculate total pages

    const posts = await postModel
      .find()
      .skip(skip)
      .limit(limit)
      .populate("category")
      .populate("tag")
      .populate("author")
      .exec();

    const formattedPosts = posts.map((post) => ({
      title: post.title,
      slug: post.slug,
      id: post._id,
      status: post.status,
      categoryName: post.category ? post.category.name : "Unknown Category",
      tagName: post.tag ? post.tag.name : "Unknown Tag",
      authorName: post.author ? post.author.name : "Unknown Author",
      createdAt: post.formatCreatedAt ? post.formatCreatedAt() : post.createdAt, // Check if formatCreatedAt is defined
      content: post.content,
    }));

    const category = await blogCategoryModel.find();
    const tag = await tagModel.find();
    const author = await authorModel.find();

    res.render("admin/blog", { posts: formattedPosts, category, tag, author, currentPage: page, totalPages });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/admin/blog/create", async function (req, res, next) {
  try {
    const author = await authorModel.find();
    const category = await blogCategoryModel.find();
    const tag = await tagModel.find();
    res.render("admin/create", { author, category, tag });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/admin/blog/category", async function (req, res, next) {
  try {
    const posts = await postModel.find().populate("category").exec();
    const blogCategories = await blogCategoryModel.find({ categoryType: 'blog' });
    res.render("admin/blog_categories", { posts, blogCategories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/admin/blog/tag", async function (req, res, next) {
  try {
    const posts = await postModel.find().populate("tag").exec();
    const tag = await tagModel.find();
    res.render("admin/tag", { posts, tag });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/admin/blog/author", async function (req, res, next) {
  try {
    const posts = await postModel.find().populate("author").exec();
    const author = await authorModel.find();
    res.render("admin/author", { posts, author });
  } catch (error) {
    console.error("Error fetching authors:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/admin/blog/category/create", function (req, res, next) {
  res.render("admin/createcategory");
});

router.get("/admin/blog/tag/create", function (req, res, next) {
  res.render("admin/createtags");
});

router.get("/admin/blog/author/create", function (req, res, next) {
  res.render("admin/createauthor");
});

router.post("/createcategory", async function (req, res, next) {
  try {
    const { name } = req.body;
    const slug = slugify(name, { lower: true });
    const category = await blogCategoryModel.create({ name, slug, categoryType: 'blog' });
    await category.save();
    res.redirect("/admin/blog/category");
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/createtags", async function (req, res, next) {
  try {
    const { name } = req.body;
    const slug = slugify(name, { lower: true });
    const tag = await tagModel.create({ name, slug });
    await tag.save();
    res.redirect("/admin/blog/tag");
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/createauthor", async function (req, res, next) {
  try {
    const { name } = req.body;
    const slug = slugify(name, { lower: true });
    const author = await authorModel.create({ name, slug });
    await author.save();
    res.redirect("/admin/blog/author");
  } catch (error) {
    console.error("Error creating author:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post(
  "/uploadpost",
  upload.single("postimage"),
  async function (req, res, next) {
    try {
      const {
        title,
        content,
        altText,
        category,
        tag,
        metaTitle,
        metaDescription,
        metaKeywords,
        name,
        status,
      } = req.body;
      const slug = slugify(title, { lower: true });
      const author = await authorModel.findOne({ _id: name });

      if (!author) {
        return res.status(404).send("Author not found");
      }

      const newPost = await postModel.create({
        author: author._id,
        title,
        content,
        slug,
        coverImage: req.file.filename,
        altText,
        category,
        tag,
        metaTitle,
        metaDescription,
        metaKeywords,
        status,
      });
      author.posts.push(newPost._id);
      await author.save();
      res.redirect("/admin/blog");
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.get("/frontend/home", async function (req, res, next) {
  try {
    const posts = await postModel
      .find(
        { status: "publish" },
        "title slug coverImage category altText author"
      )
      .populate("category")
      .populate("author")
      .sort({ createdAt: -1 })
      .limit(9);
    const formattedPosts = posts.map((post) => ({
      title: post.title,
      slug: post.slug,
      coverImage: post.coverImage,
      altText: post.altText,
      categoryNames: post.category ? post.category.map((cat) => cat.name) : [],
      authorName: post.author ? post.author.name : "Unknown Author",
    }));
    console.log("Formatted Posts:", formattedPosts);
    const category = await blogCategoryModel.find({}, "name slug").limit(4);
    const author = await authorModel.find({}, "name slug");

    res.render("frontend/index", { posts: formattedPosts, category, author });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

function extractHeadings(content) {
  const headingRegex = /<(h2|h3)[^>]*>(.*?)<\/\1>/g;
  let match;
  const headings = [];
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      level: match[1],
      text: match[2],
      index: headings.length + 1,
    });
  }
  return headings;
}

function injectAnchors(content, headings) {
  let updatedContent = content;
  headings.forEach((heading) => {
    const anchor = `<a id="section-${heading.index}"></a>`;
    const headingTag = `<${heading.level}>${heading.text}</${heading.level}>`;
    updatedContent = updatedContent.replace(
      headingTag,
      `${anchor}${headingTag}`
    );
  });
  return updatedContent;
}

router.get('/redirect', async (req, res) => {
  const couponId = req.query.couponId;
  const uParam = req.query.u;

  if (!couponId) {
    return res.status(400).send('Coupon ID is required');
  }

  try {
    // Fetch the coupon with its associated brand
    const coupon = await couponModel.findById(couponId).populate('brand');

    if (!coupon || !coupon.brand) {
      return res.status(404).send('Coupon or Brand not found');
    }

    // Use the affiliate URL from the coupon's brand
    const affiliateURL = coupon.brand.affiliateURL;
    const finalRedirectURL = uParam ? `${affiliateURL}` : affiliateURL;

    // Debug: Print the finalRedirectURL to console for troubleshooting
    console.log('Redirecting to:', finalRedirectURL);

    // Render the intermediate page with the correct URL
    res.render('frontend/redirect', {
      brandName: coupon.brand.name,
      discountCode: coupon.discountCode || null,
      targetUrl: finalRedirectURL
    });
  } catch (err) {
    console.error('Error fetching coupon:', err);
    res.status(500).send('Server error');
  }
});




router.get("/:slug", async function (req, res, next) {
  try {
    const slug = req.params.slug;
    const post = await postModel
      .findOne({ slug: slug })
      .populate("category", "name")
      .populate("author", "name slug");

    if (post) {
      const headings = extractHeadings(post.content);
      const updatedContent = injectAnchors(post.content, headings);
      const categoryNames = post.category
        ? post.category.map((cat) => cat.name)
        : [];
      const authorName = post.author ? post.author.name : "Unknown Author";
      const authorSlug = post.author ? post.author.slug : "unknown-author";

      res.render("frontend/blog", {
        post: {
          ...post._doc,
          content: updatedContent,
          categoryNames,
          authorName,
          authorSlug,
        },
        headings,
        meta: {
          title: post.metaTitle || post.title,
          description: post.metaDescription,
          keywords: post.metaKeywords,
          altText: post.altText,
          ogTitle: post.ogTitle || post.title,
          ogType: post.ogType || "article",
          ogUrl: `https://dopedwellologie.com/${post.slug}`,
          ogImage: post.ogImage || post.coverImage,
          ogDescription: post.ogDescription || post.metaDescription,
          twitterCard: post.twitterCard || "summary",
          twitterUrl: `https://dopedwellologie.com/${post.slug}`,
          twitterTitle: post.twitterTitle || post.title,
          twitterDescription: post.twitterDescription || post.metaDescription,
          twitterImage: post.twitterImage || post.coverImage,
        },
      });
    } else {
      res.status(404).send("Postss not found");
    }
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route for Edit Post
router.get("/admin/blog/:id/edit", async function (req, res, next) {
  try {
    const postId = req.params.id;
    const post = await postModel
      .findById(postId)
      .populate("category")
      .populate("tag")
      .populate("author");

    if (!post) {
      return res.status(404).send("Post not found");
    }

    const category = await blogCategoryModel.find({}, "name _id");

    res.render("admin/edit", { post, category }); // Pass category to the template
  } catch (error) {
    console.error("Error fetching post for edit:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/admin/blog/:id/edit", async function (req, res) {
  try {
    const postId = req.params.id;

    // Find the post to get the current image
    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }

    // Update the fields
    const updatedData = {
      title: req.body.title,
      slug: req.body.slug,
      category: req.body.category,
      tag: req.body.tag,
      author: req.body.author,
      coverImage: req.body.postimage || post.coverImage, // Retain current image if not updated
      altText: req.body.altText,
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
      metaKeywords: req.body.metaKeywords,
      content: req.body.content,
      status: req.body.status,
    };

    const updatedPost = await postModel
      .findByIdAndUpdate(postId, updatedData, {
        new: true,
        runValidators: true,
      })
      .populate("category")
      .populate("tag")
      .populate("author");

    res.redirect("/admin/blog");
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/admin/blog/:id/delete", async function (req, res) {
  try {
    const postId = req.params.id;

    // Find the post by ID and delete it
    const deletedPost = await postModel.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Respond with a success message
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route for Edit Category
router.get("/admin/blog/category/:id/edit", async function (req, res, next) {
  try {
    const categoryId = req.params.id;
    const category = await blogCategoryModel.findById(categoryId);

    if (!category) {
      return res.status(404).send("Category not found");
    }

    res.render("admin/editcategory", { category }); // Pass category to the template
  } catch (error) {
    console.error("Error fetching post for edit:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/admin/blog/category/:id/edit", async function (req, res) {
  try {
    const categoryId = req.params.id;

    // Find the post to get the current image
    const category = await blogCategoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).send("Category not found");
    }

    // Update the fields
    const updatedCategory = {
      name: req.body.name,
      slug: req.body.slug,
    };

    const updatedData = await blogCategoryModel.findByIdAndUpdate(
      categoryId,
      updatedCategory,
      {
        new: true,
        runValidators: true,
      }
    );

    res.redirect("/admin/blog/category");
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route for deleting category
router.post("/admin/blog/category/:id/delete", async function (req, res) {
  try {
    const categoryId = req.params.id;

    // Find the post by ID and delete it
    const deletedPost = await blogCategoryModel.findByIdAndDelete(categoryId);

    if (!deletedPost) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Respond with a success message
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route for Edit Author
router.get("/admin/blog/author/:id/edit", async function (req, res, next) {
  try {
    const authorId = req.params.id;
    const author = await authorModel.findById(authorId);

    if (!author) {
      return res.status(404).send("Author not found");
    }

    res.render("admin/editauthor", { author }); // Pass author to the template
  } catch (error) {
    console.error("Error fetching author for edit:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/admin/blog/author/:id/edit", async function (req, res) {
  try {
    const authorId = req.params.id;
    // Find the post to get the current image
    const author = await authorModel.findById(authorId);
    if (!author) {
      return res.status(404).send("Author not found");
    }
    // Update the fields
    const updatedAuthor = {
      name: req.body.name,
      slug: req.body.slug,
    };

    const updatedDatas = await authorModel.findByIdAndUpdate(
      authorId,
      updatedAuthor,
      {
        new: true,
        runValidators: true,
      }
    );

    res.redirect("/admin/blog/author");
  } catch (error) {
    console.error("Error updating author:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route for deleting Author
router.post("/admin/blog/author/:id/delete", async function (req, res) {
  try {
    const authorId = req.params.id;

    // Find the post by ID and delete it
    const deletedPost = await authorModel.findByIdAndDelete(authorId);

    if (!deletedPost) {
      return res.status(404).json({ error: "Author not found" });
    }

    // Respond with a success message
    res.status(200).json({ message: "Author deleted successfully" });
  } catch (error) {
    console.error("Error deleting author:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route for Edit Tag
router.get("/admin/blog/tag/:id/edit", async function (req, res, next) {
  try {
    const tagId = req.params.id;
    const tag = await tagModel.findById(tagId);

    if (!tag) {
      return res.status(404).send("Tag not found");
    }

    res.render("admin/edittag", { tag }); // Pass author to the template
  } catch (error) {
    console.error("Error fetching tag for edit:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/admin/blog/tag/:id/edit", async function (req, res) {
  try {
    const tagId = req.params.id;
    // Find the post to get the current image
    const tag = await tagModel.findById(tagId);
    if (!tag) {
      return res.status(404).send("Tag not found");
    }
    // Update the fields
    const updatedTag = {
      name: req.body.name,
      slug: req.body.slug,
    };

    const updatedDatas = await tagModel.findByIdAndUpdate(tagId, updatedTag, {
      new: true,
      runValidators: true,
    });

    res.redirect("/admin/blog/tag");
  } catch (error) {
    console.error("Error updating tag:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route for deleting Author
router.post("/admin/blog/tag/:id/delete", async function (req, res) {
  try {
    const tagId = req.params.id;

    // Find the post by ID and delete it
    const deletedPost = await tagModel.findByIdAndDelete(tagId);

    if (!deletedPost) {
      return res.status(404).json({ error: "Tag not found" });
    }

    // Respond with a success message
    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// CODE FOR PAGES

router.get("/blog/search", async (req, res) => {
  try {
    const query = req.query.q;
    const posts = await postModel
      .find({
        $text: { $search: query },
      })
      .populate("category")
      .populate("tag")
      .populate("author");

    res.render("frontend/blogSearch", { posts, query });
  } catch (error) {
    console.error("Error fetching search results:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/blog/category/:slug", async (req, res) => {
  try {
    const categorySlug = req.params.slug;

    // Find the category based on the slug
    const category = await blogCategoryModel.findOne({ slug: categorySlug });

    if (!category) {
      return res.status(404).send("Category not found");
    }

    // Find all posts belonging to the specified category
    const posts = await postModel
      .find({ category: category._id })
      .populate("category")
      .populate("tag")
      .populate("author");

    res.render("frontend/blogCategory", { posts, category });
  } catch (error) {
    console.error("Error fetching category list:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Creating Brand 
// Get all brands
router.get('/admin/brand', async (req, res) => {
  try {
    const brands = await brandModel.find();
    res.render('admin/brand', { brands });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Get create brand form
router.get('/admin/brand/create', async (req, res) => {
  const category = await brandCategoryModel.find();
  res.render('admin/createBrand', { brand: {}, category });
});

// Create a new brand
router.post(
  "/brandcreate",
  upload.single("image"),
  async function (req, res, next) {
    try {
      const {
        name,
        description,
        sidebarDescription,
        category,
        aboutSectionHeading,
        affiliateURL,
        metaTitle,
        metaDescription,
        metaKeywords,
      } = req.body;
      const identifier = slugify(name, { lower: true });

    

      const newBrand = await brandModel.create({
        name,
        description,
        identifier,
        image: req.file.filename,
        sidebarDescription,
        category,
        affiliateURL,
        metaTitle,
        metaDescription,  
        metaKeywords,
        aboutSectionHeading,
        coupon: []
      });
      await newBrand.save();
      res.redirect("/admin/brand");
    } catch (error) {
      console.error("Error creating brand:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route for Edit Brand
router.get("/admin/brand/:id/edit", async function (req, res, next) {
  try {
    const brandId = req.params.id;
    const brand = await brandModel
      .findById(brandId);

    
    

    res.render("admin/editbrand", { brand }); // Pass category to the template
  } catch (error) {
    console.error("Error fetching post for edit:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/admin/brand/:id/edit", async function (req, res) {
  try {
    const brandId = req.params.id;

    // Find the post to get the current image
    const brand = await brandModel.findById(brandId);
    

    // Update the fields
    const updatedData = {
      name: req.body.name,
      titleSuffix: req.body.titleSuffix ,
      identifier: req.body.identifier,
      affiliateURL: req.body.affiliateURL,
      category: req.body.category,
      image: req.body.image || brand.image,
      redirection: req.body.redirection,
      brandDynamicContent: req.body.brandDynamicContent,
      metaTitle: req.body.metaTitle,
      metaKeywords: req.body.metaKeywords,
      metaDescription: req.body.metaDescription,
      offersTableHeading: req.body.offersTableHeading,
      aboutSectionHeading: req.body.aboutSectionHeading,
      sidebarDescription: req.body.sidebarDescription,
      description: req.body.description,
      rating: req.body.rating,
      ratingCount: req.body.ratingCount,
    };

    const updatedBrand = await brandModel
      .findByIdAndUpdate(brandId, updatedData, {
        new: true,
        runValidators: true,
      });

    res.redirect("/admin/brand");
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/admin/brand/:id/delete", async function (req, res) {
  try {
    const brandId = req.params.id;

    // Find the post by ID and delete it
    const deletedBrand = await brandModel.findByIdAndDelete(brandId);

    

    // Respond with a success message
    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to display the coupon creation form
router.get('/admin/coupons/create', async (req, res) => {
  try {
    const brands = await brandModel.find({});
    res.render('admin/createCoupon', { brands });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to handle coupon creation
router.post('/admin/coupons/create', async (req, res) => {
  try {
    const {
      title,
      affiliateURL,
      discountCode,
      dynamicContent,
      brandId,
      freeShipping,
      bestCoupon,
      exclusive,
      available,
      expiry,
      description
    } = req.body;

    // Create a new coupon
    const newCoupon = new couponModel({
      title,
      affiliateURL,
      discountCode,
      dynamicContent,
      brand: brandId,
      freeShipping: freeShipping === 'on',
      bestCoupon: bestCoupon === 'on',
      exclusive: exclusive === 'on',
      available: available === 'on',
      expiry,
      description
    });

    const brand = await brandModel.findById(brandId);

    if (!brand) {
      return res.status(404).send('Brand not found');
    }

    // Ensure coupons field is initialized
    if (!Array.isArray(brand.coupon)) {
      brand.coupon = [];
    }

    // Add the new coupon to the brand's coupons array
    brand.coupon.push(newCoupon._id);

    await newCoupon.save(); // Save the coupon first
    await brand.save(); // Then save the brand

    res.redirect('/admin/coupons');
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Route to display all coupons
router.get('/admin/coupons', async (req, res) => {
  try {
    const coupons = await couponModel.find({}).populate('brand');
    res.render('admin/coupons', { coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to display the store page for a brand based on its identifier
router.get('/store/:identifier', async (req, res) => {
  try {
    const identifier = req.params.identifier;
    const brand = await brandModel.findOne({ identifier }).populate('coupon');

    if (!brand) {
      return res.status(404).send('Brand not found');
    }

    // Debugging log
    console.log('Fetched Brand:', brand);

    // Generate a unique parameter
    const uParam = crypto.randomBytes(16).toString('hex');

    res.render('frontend/store', { brand, coupon: brand.coupon, affiliateURL: brand.affiliateURL, uParam: encodeURIComponent(uParam) });
  } catch (error) {
    console.error('Error fetching brand store page:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Route for Edit Coupon
router.get("/admin/coupon/:id/edit", async function (req, res, next) {
  try {
    const couponId = req.params.id;
    const coupon = await couponModel
      .findById(couponId);
      const brands = await brandModel.find({});
      
    res.render("admin/editcoupon", { coupon, brands }); // Pass coupon to the template
  } catch (error) {
    console.error("Error fetching post for edit:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/admin/coupon/:id/edit", async function (req, res) {
  try {
    const couponId = req.params.id;

    // Find the post to get the current image
    const coupon = await couponModel.findById(couponId);
    

    // Update the fields
    const updatedData = {
      title: req.body.title,
      affiliateURL: req.body.affiliateURL,
      discountCode: req.body.discountCode,
      dynamicContent: req.body.dynamicContent,
      brand: req.body.brand,
      freeShipping: req.body.freeShipping,
      bestCoupon: req.body.bestCoupon,
      exclusive: req.body.exclusive,
      available: req.body.available,
      expiry: req.body.expiry,
      description: req.body.description,
    };

    const updatedCoupon = await couponModel
      .findByIdAndUpdate(couponId, updatedData, {
        new: true,
        runValidators: true,
      });

    res.redirect("/admin/coupons");
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/admin/coupon/:id/delete", async function (req, res) {
  try {
    const couponId = req.params.id;
    // Find the post by ID and delete it
    const deletedCoupon = await couponModel.findByIdAndDelete(couponId);
    // Respond with a success message
    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/admin/category", async function (req, res, next) {
  try {
    const brands = await brandModel.find().populate("categories").exec();
    const generalCategories = await brandCategoryModel.find({ categoryType: 'general' });
    res.render("admin/categories", { brands, generalCategories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/admin/category/create", function (req, res, next) {
  res.render("admin/createcategories");
});

router.post("/createcategories", async function (req, res, next) {
  try {
    const { title } = req.body;
    const slug = slugify(title, { lower: true });
    const generalCategories = await brandCategoryModel.create({ title, slug, categoryType: 'general' });
    await generalCategories.save();
    res.redirect("/admin/category");
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).send("Internal Server Error");
  }
});




module.exports = router;
