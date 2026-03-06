const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Groq = require("groq-sdk");
const Expense = require("../models/Expense"); // ← ADD THIS LINE

router.post("/chat", auth, async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1000,
    });

    const text = completion.choices[0]?.message?.content || "Sorry, I couldn't process that.";

    res.json({ content: [{ text }] });
  } catch (err) {
    console.error("Groq API error:", err);
    res.status(500).json({ message: err.message });
  }
});

// / ── NEW: AI Spending Prediction route ─────────────────────────────────────────
router.get("/predict", auth, async (req, res) => {
  try {
    // Get last 3 months of expenses
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const expenses = await Expense.find({
      user: req.userId,
      date: { $gte: threeMonthsAgo },
    });

    if (expenses.length === 0) {
      return res.json({
        predictions: [],
        insight: "Add at least a few expenses so I can start predicting your spending patterns!",
        hasData: false,
      });
    }

    // Build monthly breakdown per category
    const monthlyByCategory = {};

    expenses.forEach((exp) => {
      const month = new Date(exp.date).getMonth();
      const cat = exp.category;
      if (!monthlyByCategory[cat]) monthlyByCategory[cat] = {};
      if (!monthlyByCategory[cat][month]) monthlyByCategory[cat][month] = 0;
      monthlyByCategory[cat][month] += Number(exp.amount);
    });

    // Build summary string for Groq
    const summaryLines = Object.entries(monthlyByCategory).map(([cat, months]) => {
      const amounts = Object.values(months);
      const avg = Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length);
      const trend = amounts.length > 1
        ? amounts[amounts.length - 1] > amounts[0] ? "increasing" : "decreasing"
        : "stable";
      return `${cat}: monthly amounts ₹${amounts.join(", ₹")} (avg ₹${avg}, trend: ${trend})`;
    });

    const prompt = `You are a financial analyst AI. Analyze this user's last 3 months of spending data and predict next month's spending per category.

SPENDING DATA:
${summaryLines.join("\n")}

Respond ONLY with a valid JSON object in this exact format, no extra text:
{
  "predictions": [
    {
      "category": "Food",
      "avgSpent": 7100,
      "predicted": 8200,
      "trend": "up",
      "trendPercent": 15,
      "status": "warning",
      "advice": "Short one-line advice"
    }
  ],
  "insight": "One overall insight sentence about spending patterns (max 20 words)",
  "topRisk": "Category most likely to overspend"
}

Rules:
- trend must be "up", "down", or "stable"
- status must be "good" (predicted < avg), "warning" (predicted 10-30% above avg), or "danger" (predicted 30%+ above avg)
- trendPercent is the % change from avg to predicted (positive number)
- advice must be under 12 words
- insight must be under 20 words
- include ALL categories from the data`;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0,
    });

    const raw = completion.choices[0]?.message?.content || "{}";

    // Safely parse JSON
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    res.json({ ...parsed, hasData: true });
  } catch (err) {
    console.error("Predict API error:", err);
    res.status(500).json({ message: err.message });
  }
});

//  ── NEW: AI Budget Auto-Suggest route ─────────────────────────────────────────
// Analyzes last 3 months of expenses and suggests smart budget limits per category
router.get("/suggest-budgets", auth, async (req, res) => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const expenses = await Expense.find({
      user: req.userId,
      date: { $gte: threeMonthsAgo },
    });

    if (expenses.length === 0) {
      return res.json({
        suggestions: [],
        hasData: false,
        message: "Add at least a few expenses so I can suggest budgets for you!",
      });
    }

    // Build monthly breakdown per category
    const monthlyByCategory = {};
    expenses.forEach((exp) => {
      const month = new Date(exp.date).getMonth();
      const cat = exp.category;
      if (!monthlyByCategory[cat]) monthlyByCategory[cat] = {};
      if (!monthlyByCategory[cat][month]) monthlyByCategory[cat][month] = 0;
      monthlyByCategory[cat][month] += Number(exp.amount);
    });

    // Build summary for Groq
    const summaryLines = Object.entries(monthlyByCategory).map(([cat, months]) => {
      const amounts = Object.values(months);
      const avg = Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length);
      const max = Math.max(...amounts);
      return `${cat}: avg ₹${avg}/month, max ₹${max}/month over ${amounts.length} month(s)`;
    });

    const prompt = `You are a smart financial advisor AI. Based on the user's last 3 months of spending, suggest realistic monthly budget limits for each category.

SPENDING DATA:
${summaryLines.join("\n")}

Rules for suggesting budgets:
- Suggest a limit that is 10-20% HIGHER than average (to be realistic, not too strict)
- If a category is clearly overspent, suggest a limit at the average (to encourage reduction)
- Round to nearest 500 rupees for clean numbers
- Give a short reason for each suggestion (max 8 words)

Respond ONLY with a valid JSON array, no extra text:
[
  {
    "category": "Food",
    "avgSpent": 6200,
    "suggestedLimit": 7000,
    "reason": "Slightly above your average spending",
    "period": "monthly"
  }
]

Include ALL categories from the data.`;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0,
    });

    const raw = completion.choices[0]?.message?.content || "[]";
    const clean = raw.replace(/```json|```/g, "").trim();
    const suggestions = JSON.parse(clean);

    res.json({ suggestions, hasData: true });
  } catch (err) {
    console.error("Suggest budgets error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ── NEW: Month-End AI Recap route ──────────────────────────────────────────────
// Returns last month's summary + AI insights + predictions for this month
router.get("/monthly-recap", auth, async (req, res) => {
  try {
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const monthName = lastMonthStart.toLocaleString("default", { month: "long" });

    const expenses = await Expense.find({
      user: req.userId,
      date: { $gte: lastMonthStart, $lte: lastMonthEnd },
    });

    if (expenses.length === 0) {
      return res.json({
        hasData: false,
        monthName,
        message: "No expenses found for last month.",
      });
    }

    const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);

    // Category breakdown
    const byCategory = {};
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
    });
    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    const categoryLines = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => `${cat}: ₹${amt.toLocaleString()}`)
      .join("\n");

    const prompt = `You are a personal finance AI giving a monthly recap to a user.

LAST MONTH (${monthName}) SPENDING:
Total Spent: ₹${totalSpent.toLocaleString()}
Top Category: ${topCategory[0]} (₹${Number(topCategory[1]).toLocaleString()})

Category Breakdown:
${categoryLines}

Give a friendly, insightful monthly recap. Respond ONLY with this exact JSON format, no extra text:
{
  "overallVerdict": "One sentence verdict on their spending (max 15 words, warm tone)",
  "biggestWin": "One positive thing they did well (max 12 words)",
  "biggestRisk": "One area they overspent or should watch (max 12 words)",
  "topTip": "One actionable tip for this month (max 15 words)",
  "savingsScore": <number 1-10 rating of how well they managed spending>
}`;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const aiInsights = JSON.parse(clean);

    res.json({
      hasData: true,
      monthName,
      totalSpent,
      byCategory,
      topCategory: { name: topCategory[0], amount: topCategory[1] },
      expenseCount: expenses.length,
      ...aiInsights,
    });
  } catch (err) {
    console.error("Monthly recap error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
