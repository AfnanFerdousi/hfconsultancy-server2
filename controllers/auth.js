const fs =require("fs");
const { signupService, findUserByEmail } = require("../services/auth");
const jwt =require("jsonwebtoken");
const {generateToken}=require("../helpers/auth");
const Order =require("../models/order.js");
const User=require("../models/user");
const multer = require('multer');


exports.register = async (req, res) => {
  try {
    const user = await signupService(req.body);
    await user.save({ validateBeforeSave: false }); 
    //  // 6. create signed jwt
    //  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: "7d",
    // }); 
    const token = generateToken(user);
    user.password = undefined;
    // send token in cookie
    res.cookie("token", token, {
     httpOnly: true,
     // secure: true, // only works on https
   }); 
    res.status(200).json({
      status: "success",
      message: "Successfully signed up",
      user:{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        address: user.address
      },
      token
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      message:error.message,
      
    });
  }
}
 

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        status: "fail",
        error: "Please provide your credentials",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: "fail",
        error: "No user found. Please create an account",
      });
    }
    const isPasswordValid = user.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(403).json({
        status: "fail",
        error: "Password is not correct",
      });
    }
    const token = generateToken(user);
     user.password = undefined;
     // send token in cookie
     res.cookie("token", token, {
      httpOnly: true,
      // secure: true, // only works on https
    });

     // send user as json response
// console.log("userTest=======>",user)
    res.status(200).json({
      status: "success",
      message: "Successfully logged in",
      user,
      token
      // data: {
      //   user,
      //   token,
      // },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      error: error.message,
    });
  }
};

exports.secret = async (req, res) => {
  res.json({ currentUser: req.auth });
};

exports.updateProfile = async (req, res) => {
  try {
    const storage=multer.diskStorage({
      destination: (req,file,callBack)=> {
          callBack(null,'public/media');
      },
      filename: (req,file,callBack)=> {
          callBack(null,file.originalname)
      }    
      
  });
  const maxSize = 5 * 1024 * 1024; // for 5MB  
  const upload=multer({
    storage:storage,
    fileFilter: (req, file, cb)=> {
      if(file.mimetype==="image/jpg"||
        file.mimetype==="image/png"||
        file.mimetype==="image/jpeg"||
        file.mimetype==="image/webp"      
      ){
        cb(null, true)
      }else{
        cb(null, false);
        return cb(new Error("Only jpg, png, jpeg and webp format is allowed"))
      }
    },
    limits: { fileSize: maxSize }
  }).fields([{ name: 'logo', maxCount: 1 }, { name: 'photo', maxCount: 8 }])
  upload(req,res, async(error)=> {  
    // console.log("req.fields", req.body);
    // console.log("req.files", req.files);    
     const existingUser = await User.findById(req.auth._id);  
     console.log("test Existing user=====>",existingUser)

    const user = await User.findByIdAndUpdate(
      // req.params.subjectId,
      existingUser._id,
      {
        ...req.body,       
        photo:{
              data:fs.readFileSync(req.files['photo'][0].path),
              contentType: req.files['photo'][0].mimetype
              }      
      },
      { new: true }
    );

    await user.save({ validateBeforeSave: false }); 
   
      res.json(user);
    if (error instanceof multer.MulterError) {        
      res.status(400).json({
        status:"Fail",
        message:error.message
      })
    } else if (error) {      
      res.status(400).json({
        status:"Fail",
        message:error.message
      })
    } 
});   





    // const { firstName,lastName, address } = req.body;
    // const user = await User.findById(req.auth._id);  
    // console.log("test user",user)

    // const updated = await User.findByIdAndUpdate(
    //   user._id,
    //   {
    //     firstName: firstName || user.firstName,
    //     lastName: lastName || user.lastName,       
    //     address: address || user.address
    //   },
    //   { new: true }
    // );
   
    // res.json(updated);
  } catch (err) {
    console.log(err);
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (err) {
    console.log(err);
  }
};

exports.allOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });
    res.json(orders);
  } catch (err) {
    console.log(err);
  }
};

exports.photo = async (req, res) => {
  try {
    console.log("id testing=====>",req.params.id)
    const user = await User.findById(req.params.id)
    .select("photo")   
    console.log("contentType testing=====>",user.photo.contentType)
    // if (user.photo.data) {
    //   res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    //   res.set("Content-Type", user.photo.contentType);
    //   return res.send(user.photo.data);
    // }
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
      res.set("Content-Type", user.photo.contentType);
      return res.send(user.photo.data);
  } catch (err) {
    console.log(err);
  }
};
