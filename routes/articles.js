const express = require("express"),
  router = express.Router();
const { Article, validateArticle } = require("../models/article");
const { User } = require("../models/user");
const multer = require('multer');
const auth = require("../middleware/auth");
const uploadMiddleware = require("../middleware/uploadFileMiddleware");
const {uploadFile, deleteFile} = require("../utils/uploadFile");

router.get("/", async (req, res) => {
  const articles = await Article.find().sort("title");
 return res.send(articles);
});

router.get("/:id", async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (!article)
    return res.status(404).send("Article not found");

 return res.send(article);
});


router.post("/",[ auth,uploadMiddleware.single("thumb")] ,async (req, res) => {
  console.log(req)
  const { error } = validateArticle(req.body);
  if (error) {
    await deleteFile(req.file.path)
    return res.status(400).send(error.details[0].message);}


    function slugify(val) {
      return val
        ?.toString()
        .toLowerCase()
        .trim()
        .replace(/&/g, "-and-") // Replace & with 'and'
        .replace(/[\s\W-]+/g, "-"); // Replace spaces, non-word characters and dashes with a single dash (-)
  }
  
  
const data = await uploadFile(req.file.path)
// console.log(data)
  const article = new Article({
    title: req.body.title,
    body: req.body.body,
    author: req.user.name,
    owner:req.user._id,
    thumb:data.secure_url,
    thumb_id:data.public_id,
    slug:slugify(req.body.title)
  });
await deleteFile(req.file.filename)
  await article.save(); 
 return res.send(article);
});
module.exports = router;