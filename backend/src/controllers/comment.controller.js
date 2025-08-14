import asyncHandler from "express-async-handler"
import Comment from "../models/comment.model.js";
import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
export const getComments = asyncHandler(async (req, res) => {
    const { postId } = req.params
    // Fetch comments for the post
    const comments = await Comment.find({ post: postId }).sort({ createdAt: -1 }).populate("user", "usrname firstName lastName profilePicture");
    res.status(200).json(comments);

})

export const createComment = asyncHandler(async (req, res) => {
    const { postId } = req.params
    const { content } = req.body//comment
    const userId = getAuth(req)

    if(!content || content.trim() === "") {
        return res.status(400).json({ message: "Comment content is required" })
    }
    const user = await User.findOne({clerkId:userId});
    const post  = await Post.findOne(postId)

    if(!user || !post) return res.status(404).json({ message: "User or Post not found" });

    const comment = await Comment.create({
        user: user._id,
        post: postId,
        content
    })
    //link the comment to the post
    await Post.findByIdAndUpdate(postId,{
        $push: { comments: comment._id }
    })
    // create notification if we are not the creator of the post
    if(user._id.toString() !== post.user.toString()) {
        // Create a notification
        await Notification.create({
            from: user._id,
            to: post.user,
            type:"comment",
            post: postId,
            comment: comment._id,
        })
    }

    res.status(201).json({comment});

})

export const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = getAuth(req)
     const user = await User.findOne({ clerkId: userId });
    const comment = await Comment.findById(commentId)

    if(!comment || !user) {
        return res.status(404).json({ message: "Comment or user not found" })
    }

    if(comment.user.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to delete this comment" })
    }
    //remove comment from the post
    await Post.findByIdAndUpdate(comment.post, {
        $pull: { comments: commentId }
    })

    //delete the comment
    await Comment.findByIdAndDelete(commentId)

    res.status(200).json({ message: "Comment deleted successfully" });
})