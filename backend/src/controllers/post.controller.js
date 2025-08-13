import asyncHandler from 'express-async-handler';
import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import { getAuth } from '@clerk/express';
import cloudinary from '../config/cloudinary.js';

export const getPosts = asyncHandler(async (req, res) => {
    const posts = (await Post.find()).sort({ createdAt: -1 }).populate("user", "username firstName lastName profilePicture")
        .populate({
            path: "comments",
            populate: {
                path: "user",
                select: "username firstName lastName profilePicture"
            }
        });
    res.status(200).json({ posts })
})

export const getPost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const post = await Post.findById(postId).populate("user", "username firstName lastName profilePicture")
        .populate({
            path: "comments",
            populate: {
                path: "user",
                select: "username firstName lastName profilePicture"
            }
        });
    if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
    }
    res.status(200).json({ post });
})


export const getUserPosts = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 }).populate("user", "username firstName lastName profilePicture")
        .populate({
            path: "comments",
            populate: {
                path: "user",
                select: "username firstName lastName profilePicture"
            }
        });
    if (!posts) {
        res.status(404).json({ message: "No posts found" });
        return;
    }
    res.status(200).json({ posts });
})


export const createPost = asyncHandler(async (req, res) => {
    const { userid } = getAuth(req);
    const { content } = req.body;
    const imageFile = req.file;

    if (!content && !imageFile) {
        res.status(400).json({ message: "post must Contain text or image" });
        return;
    }
    const user = await User.findById({ clerkId: userid });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    let imageUrl = "";
    if (imageFile) {
        try {
            //convert buffer to base64 for cloudinary
            const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString('base64')}`;
            const uploadResponse = await cloudinary.uploader.upload(base64Image, {
                folder: "social_media_posts",
                resource_type: "image",
                transformation: [
                    {
                        width: 800,
                        height: 800,
                        crop: "limit"
                    },
                    { quality: "auto" },
                    { format: "auto" }
                ]
            });
            imageUrl = uploadResponse.secure_url;
        } catch (error) {
            console.error("Error uploading image to Cloudinary:", error);
            return res.status(500).json({message:"failed to upload image"})
        }
    }

    const post = await Post.create({
        content: content || "",
        image: imageUrl,
        user: user._id
    });
    res.status(201).json({ post });

})

export const likePost = asyncHandler(async(req,res)=>{
    //get the post and the user
    const {userId} = getAuth(req);
    const {postId} = req.params;
    const user = await User.findById({clerkId:userId});
    const post = await Post.findById(postId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    //check if the user has already liked the post
    const hasLiked = post.likes.includes(user._id);
    if (hasLiked) {
       //unlike
       await Post.findByIdAndUpdate(postId, {
           $pull: { likes: user._id }
       });
    }else{
        //like
        await Post.findByIdAndUpdate(postId, {
            $push: { likes: user._id }
        });
    }
    //create notification if not liking own post
    if(post.user.toString() !== user._id.toString()){
        await Notification.create({
            from: user._id,
            to: post.user,
            type: "like",
            post: postId
        });
    }

    res.status(200).json({ message: hasLiked ? "Post unliked successfully" : "Post liked successfully" });
})