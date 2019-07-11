const mongoos = require("mongoose");
const Post = mongoos.model("Post");
const multer = require("multer");
const jimp = require("jimp");

const imageUploadOptions = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 1
  },
  fileFilter: (req, res, next) => {
    if (file.mimeType.startsWith("image/")) {
      next(null, true);
    } else {
      next(null, false);
    }
  }
};

exports.uploadImage = multer(imageUploadOptions).single("image");

exports.addPost = async (req, res) => {
  req.body.potedBy = req.user._id;
  const post = await new Post(req.body).save();
  await post.populate(post, {
    path: "postedBy",
    select: "_id name avatar"
  });
  res.json(post);
};

exports.resizeImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  const extension = req.file.mimeType.split("/")[1];
  req.body.image = `/static/uploads/${
    req.user.name
  }-${Date.now()}.${extension}`;

  const image = await jimp.read(req.file.buffer);
  await image.resize(250, jimp.auto);
  await image.write(`req.body.avatar`);
  next();
};

exports.getPostById = async (req, res, next, id) => {
  const post = await Post.findOne({ _id: id });
  req.post = post;
  const posterId = mongoos.Types.ObjectId(req.post.postedBy._id);
  if (req.user && posterId.equals(req.user._id)) {
    req.isPoster = true;
    return next();
  }
  next();
};

exports.deletePost = async (req, res) => {
  if (!req.isPoster) {
    return res.status(400).json({
      message: "You are not authorized to perform this action"
    });
  }
  const deletedPost = await Post.findOneAndDelete({ _id: req.post._id });

  res.json(deletedPost);
};

exports.getPostsByUser = async (req, res) => {
  const post = await Post.find({ postedBy: req.profile._id }).sort({
    createdAt: "desc"
  });
  res.json(post);
};

exports.getPostFeed = async (req, res) => {
  const { following, _id } = req.body;
  following.push(_id);

  const posts = await Post.find({
    postedBy: { $in: following }
  }).sort({
    createdAt: "desc"
  });
  res.json(posts);
};

exports.toggleLike = async (req, res) => {
  const { postId } = req.body;
  const post = await Post.findOne({ _id: postId });
  const likeIds = post.likes.map(id => id.toString());
  const authUserId = req.user._id.toString();
  if (likeIds.includes(authUserId)) {
    await post.likes.pull(authUserId);
  } else {
    await post.likes.push(authUserId);
  }
  await post.save();
  res.json(post);
};

exports.toggleComment = async (req, res) => {
  const { comment, postId } = req.body;
  let operator;
  let data;

  if (req.url.includes(uncomment)) {
    operator = "$pull";
    data = { _id: comment._id };
  } else {
    operator = "$pull";
    data = {
      text: comment.text,
      postedBy: req.user._id
    };
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      { [operator]: { comments: data } },
      { new: true }
    )
      .populate("postedBy", "_id name avatar")
      .populate("coments.postedBy", "_id name avatar");
  }

  res.json(updatedPost);
};
