const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { addIncome, getIncome,deleteIncome,updateIncome } = require("../controllers/incomeController");

router.post("/", auth, addIncome);
router.get("/", auth, getIncome);
router.put("/:id", auth, updateIncome); // ✅ NEW
router.delete("/:id", auth, deleteIncome);

module.exports = router;
