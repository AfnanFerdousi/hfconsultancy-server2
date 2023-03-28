// const jwt =require("jsonwebtoken");
const {expressjwt} =require("express-jwt");
const User =require("../models/user.js");

exports.requireSignin = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

// exports.requireSignin = (req, res, next) => {
//   try {
//     const decoded = jwt.verify(
//       req.headers.authorization,
//       process.env.JWT_SECRET
//     );
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json(err);
//   }
// };

exports.isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.auth._id);
    if (user.role !== "admin") {
      return res.status(401).send("Unauthorized");
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
  }
};

// exports.isAdmin = async (req, res, next) => {
//   console.log("Auth Test",req.auth)
//   try {
//     const user = await User.findById(req.auth._id);
//     if (user.role !== "admin") {
//       return res.status(403).json({
//         status:"Fail",
//         message:"Unauthorized.Admin resource"
//       });
//     } else {
//       next();
//     }
//   } catch (err) {
//     console.log(err);
//   }
// };