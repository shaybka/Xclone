import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { createComment, deleteComment, getComments } from "../controllers/comment.controller.js";

const router = express.Router();

//public route
router.get("/post/:postId",getComments)
//private route
router.post("/post/:postId",protectRoute,createComment)
router.delete("/:commentId",protectRoute,deleteComment)


export default router;
