
import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import { clerkClient, getAuth } from '@clerk/express';
import Notification from '../models/notification.model.js';
export const getUserProfile= asyncHandler(async(req,res)=>{
    const { username } = req.params;
    const user = await User.findOne({username});
    if(!user){
        return res.status(404).json({error:"User not found"});
    }
    res.status(200).json({user});
})
export const updateProfile = asyncHandler(async(req,res)=>{
    const {userId} = getAuth(req);
    const user = await User.findOneAndUpdate({clerkId:userId},req.body,{new:true})
    if(!user){
        return res.status(404).json({error:"User not found"});
    }
    res.status(200).json({user});
})
export const syncUser = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    //check user if already exist in our DB
    const ExistingUser = await User.findOne({ clerkId: userId });
    if(ExistingUser){
        return res.status(200).json({ user: ExistingUser,message:"user already exists" });
    }

    //create new User from Clerk data
    const clerkUser = await clerkClient.users.getUser(userId);
    const userData ={
        clerkId:userId,
        email:clerkUser.emailAddresses[0].emailAddress,
       firstName: clerkUser.firstName || "",
       lastName: clerkUser.lastName || "",
       profilePicture: clerkUser.imageUrl || "",
       username: clerkUser.emailAddresses[0].emailAddress.split("@")[0] || "" //aden@gmail.com #aden will be the username
    };

    // create to the mongodb
    const user = await User.create(userData);
    res.status(201).json({ user: user, message: "User created successfully" });
});
export const getCurrentUser= asyncHandler(async(req,res)=>{
    const { userId } = getAuth(req);
    const user = await User.findOne({clerkId:userId});
    if(!user){
        return res.status(404).json({error:"User not found"});
    }
    res.status(200).json({user});
})

export const followUser  = asyncHandler(async(req,res)=>{
    // get the both users
    const { userId } = getAuth(req);
    const {targetUserId} = req.params;
   //user can not follow it self
    if(userId === targetUserId) {
        return res.status(400).json({error:"You cannot follow yourself"});
    }
    const currentUser = await User.findOne({clerkId:userId});
    const targetUser = await User.findById(targetUserId);
    ///check if they are valid users
    if(!currentUser || !targetUser) {
        return res.status(404).json({error:"User not found"});
    }
    //check if they are already friends
    const isFollowing = currentUser.following.includes(targetUserId);
    if(isFollowing) {
        //unfollow
        await User.findByIdAndUpdate(currentUser._id, {
            $pull:{following:targetUserId}
        });
        await User.findByIdAndUpdate(targetUser._id, {
            $pull:{followers:userId}
        });
    }else{
        //follow
         await User.findByIdAndUpdate(currentUser._id, {
             $push:{following:targetUserId}
         });
         await User.findByIdAndUpdate(targetUser._id, {
             $push:{followers:userId}
         });
    }

   if (!isFollowing) {
        await Notification.create({
            from: currentUser._id,
            to: targetUser._id,
            type: "follow"
        });
    }
    res.status(200).json({message:isFollowing ? "User unfollowed successfully" : "User followed successfully"});

})