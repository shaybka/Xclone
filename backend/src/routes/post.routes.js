import express from 'express';
import { createPost, getPost, getPosts, getUserPosts, likePost } from '../controllers/post.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import { deletePost } from '../controllers/user.controller.js';

const router = express.Router();

//public-route
router.get("/",getPosts)
router.get("/:postId",getPost);
router.get("/user/:username",getUserPosts)

//protected-routes
router.post("/",protectRoute,upload.single("image"),createPost)
router.post("/:postId/like",protectRoute,likePost)
router.delete("/:postId",protectRoute,deletePost)


export default router;