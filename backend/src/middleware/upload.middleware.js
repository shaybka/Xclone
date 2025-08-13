// multer is middleware for handling multipart/form-data ,wich is primarily used for file uploads

import multer from "multer"
const storage = multer.memoryStorage();
const fileFilter= (req,file,cb)=>{
  if(file.mimetype.startsWith("image/")){
    cb(null,true);
  }else{
    cb(new Error("only image files are allowed"),false);
  }
}
const upload = multer({ storage:storage,
    fileFilter:fileFilter,
    limits:{fileSize:5 *1024 *1024 } //5mb
});


export default upload;