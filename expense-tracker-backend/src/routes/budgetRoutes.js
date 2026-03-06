const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  addBudget,
  getBudgets,
  getBudgetStatus,
  updateBudget,
  deleteBudget,
} = require("../controllers/budgetController");

router.post("/", auth, addBudget);
router.get("/", auth, getBudgets);
router.get("/status", auth, getBudgetStatus);
router.put("/:id", auth, updateBudget);
router.delete("/:id", auth, deleteBudget);

module.exports = router;