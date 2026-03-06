const express = require("express");
const router = express.Router();
const {
  register,
  login,
  updateProfile,
  changePassword,
  deleteAccount,
   forgotPassword,  // ✅ ADD
  resetPassword,  
} = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);

// ✅ ADD THESE TWO
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
// Protected routes - require auth
router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);
router.delete("/delete-account", auth, deleteAccount);


module.exports = router;
