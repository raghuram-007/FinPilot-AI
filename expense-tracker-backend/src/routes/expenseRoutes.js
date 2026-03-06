const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  addExpense,
  getExpenses,
  deleteExpense,
  updateExpense,
} = require("../controllers/expenseController");

router.post("/", auth, addExpense);
router.get("/", auth, getExpenses);
router.delete("/:id", auth, deleteExpense);

// ✅ NEW
router.put("/:id", auth, updateExpense);

module.exports = router;
