const Income = require("../models/Income");

exports.addIncome = async (req, res) => {
  try {
    const { source, amount } = req.body;

    if (!source || !amount) {
      return res.status(400).json({ message: "All fields required" });
    }

    const income = await Income.create({
      user: req.userId,
      source,
      amount,
    });

    res.status(201).json(income);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getIncome = async (req, res) => {
  try {
    const income = await Income.find({ user: req.userId }).sort({ date: -1 });
    res.json(income);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// / ✅ NEW: UPDATE INCOME
exports.updateIncome = async (req, res) => {
  try {
    const { source, amount } = req.body;

    if (!source || !amount) {
      return res.status(400).json({ message: "All fields required" });
    }

    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { source, amount },
      { new: true }
    );

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    res.json(income);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteIncome = async (req, res) => {
  try {
    await Income.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    res.json({ message: "Income deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};