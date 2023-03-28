const express =require("express");
const router = express.Router();
// middlewares
const { requireSignin, isAdmin } =require("../middlewares/auth.js");
// controllers
const {
  register,
  login,
  secret,
  updateProfile,
  getOrders,
  allOrders,
  photo
} =require("../controllers/auth.js");

router.get("/",(req,res)=>{
  res.status(200).
  json({
    status:"Success",
    message:"Welcome to Hf Consultancy"
  })
})

router.post("/register", register);
router.post("/login", login);
router.get("/auth-check",requireSignin,  (req, res) => {  
  res.json({ ok: true });
});
router.get("/admin-check", requireSignin, isAdmin, (req, res) => {
  res.json({ ok: true });
});

router.put("/profile", requireSignin, updateProfile);
router.get("/profile/photo/:id", photo);


router.get("/secret", requireSignin, isAdmin, secret);

// orders
router.get("/orders", requireSignin, getOrders);
router.get("/all-orders", requireSignin, isAdmin, allOrders);

module.exports= router;
