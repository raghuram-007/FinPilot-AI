const Budget = require("../models/Budget");
const Expense = require("../models/Expense");

// Add Budget
exports.addBudget = async (req, res) => {
  try {
    const { category, limit, period } = req.body;

    if (!category || !limit || !period) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Calculate end date based on period
    const startDate = new Date();
    let endDate = new Date();
    
    if (period === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (period === "weekly") {
      endDate.setDate(endDate.getDate() + 7);
    } else if (period === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const budget = await Budget.create({
      user: req.userId,
      category,
      limit,
      period,
      startDate,
      endDate,
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Budgets
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Budget Status (with spending)
exports.getBudgetStatus = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.userId });
    
    const budgetStatus = await Promise.all(
      budgets.map(async (budget) => {
        // Get expenses for this category within the budget period
        const expenses = await Expense.find({
          user: req.userId,
          category: budget.category,
          date: {
            $gte: budget.startDate,
            $lte: budget.endDate,
          },
        });

        const spent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const remaining = budget.limit - spent;
        const percentage = (spent / budget.limit) * 100;

        return {
          ...budget.toObject(),
          spent,
          remaining,
          percentage: Math.min(percentage, 100),
          status: percentage >= 100 ? "exceeded" : percentage >= 80 ? "warning" : "good",
        };
      })
    );

    res.json(budgetStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Budget
exports.updateBudget = async (req, res) => {
  try {
    const { category, limit, period } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { category, limit, period },
      { new: true }
    );

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Budget
exports.deleteBudget = async (req, res) => {
  try {
    await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    res.json({ message: "Budget deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};