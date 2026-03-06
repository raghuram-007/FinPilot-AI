import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// ── helpers ────────────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const getUserName = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.name?.split(" ")[0] || null;
  } catch { return null; }
};

const stopSpeaking = () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); };

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [financeData, setFinanceData] = useState(null);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeFetched, setFinanceFetched] = useState(false);
  const [smartInsights, setSmartInsights] = useState(null);

  // voice
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported] = useState(() => !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  const recognitionRef = useRef(null);

  // ── pending recurring confirmation ────────────────────────────────────────
  // { title, amount, category, type: "expense"|"income" }
  const [pendingRecurring, setPendingRecurring] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [messages, isOpen, financeLoading]);

  useEffect(() => {
    if (isOpen && !financeFetched) { setFinanceFetched(true); loadAllData(); }
    if (!isOpen) { stopSpeaking(); setIsSpeaking(false); }
  }, [isOpen]);

  useEffect(() => { if (!isOpen && isListening) stopListening(); }, [isOpen]);

  // ── speak ──────────────────────────────────────────────────────────────────
  const speakWithIndicator = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.05; utter.pitch = 1; utter.volume = 1;
    const trySpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Samantha"))) || voices.find((v) => v.lang.startsWith("en")) || voices[0];
      if (preferred) utter.voice = preferred;
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utter);
    };
    if (window.speechSynthesis.getVoices().length > 0) trySpeak();
    else window.speechSynthesis.onvoiceschanged = trySpeak;
  };

  // ── load all data ──────────────────────────────────────────────────────────
  const loadAllData = async () => {
    setFinanceLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [expRes, incRes, budRes] = await Promise.all([
        axios.get("http://localhost:5000/api/expenses", { headers }),
        axios.get("http://localhost:5000/api/income", { headers }),
        axios.get("http://localhost:5000/api/budgets/status", { headers }),
      ]);
      const expenses = expRes.data || [];
      const income = incRes.data || [];
      const budgets = budRes.data || [];

      const totalIncome = income.reduce((s, i) => s + Number(i.amount), 0);
      const totalExpense = expenses.reduce((s, e) => s + Number(e.amount), 0);
      const balance = totalIncome - totalExpense;
      const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

      const categoryBreakdown = expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + Number(e.amount); return acc; }, {});
      const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];
      const overBudget = budgets.filter((b) => b.status === "over");
      const nearBudget = budgets.filter((b) => b.percentage >= 80 && b.status !== "over");

      const now = new Date();
      const thisMonth = now.getMonth();
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const thisMonthExp = expenses.filter((e) => new Date(e.date).getMonth() === thisMonth);
      const lastMonthExp = expenses.filter((e) => new Date(e.date).getMonth() === lastMonth);
      const totalThis = thisMonthExp.reduce((s, e) => s + Number(e.amount), 0);
      const totalLast = lastMonthExp.reduce((s, e) => s + Number(e.amount), 0);
      const totalChange = totalLast > 0 ? Math.round(((totalThis - totalLast) / totalLast) * 100) : null;

      // ── detect recurring (appears 2+ times) ───────────────────────────────
      const titleCount = {};
      expenses.forEach((e) => { const k = e.title.toLowerCase().trim(); titleCount[k] = (titleCount[k] || 0) + 1; });
      const recurring = Object.entries(titleCount)
        .filter(([, c]) => c >= 2)
        .map(([title]) => { const exp = expenses.find((e) => e.title.toLowerCase().trim() === title); return { title: exp.title, amount: exp.amount, category: exp.category }; })
        .slice(0, 3);

      // ── trends ────────────────────────────────────────────────────────────
      const thisMonthByCat = {};
      const lastMonthByCat = {};
      thisMonthExp.forEach((e) => { thisMonthByCat[e.category] = (thisMonthByCat[e.category] || 0) + Number(e.amount); });
      lastMonthExp.forEach((e) => { lastMonthByCat[e.category] = (lastMonthByCat[e.category] || 0) + Number(e.amount); });
      const trends = [];
      Object.entries(thisMonthByCat).forEach(([cat, thisAmt]) => {
        const lastAmt = lastMonthByCat[cat] || 0;
        if (lastAmt > 0) { const pct = Math.round(((thisAmt - lastAmt) / lastAmt) * 100); if (Math.abs(pct) >= 15) trends.push({ category: cat, changePercent: pct }); }
      });
      trends.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));

      const summary = { totalIncome, totalExpense, balance, savingsRate, topCategory, overBudget, nearBudget, totalThis, totalLast, totalChange, hasExpenses: expenses.length > 0, budgets, categoryBreakdown, expenses, income };
      setFinanceData(summary);
      setSmartInsights({ recurring, trends: trends.slice(0, 3), totalChange, hasComparison: totalLast > 0 });
      injectGreetingMessage(summary, recurring);
    } catch (err) {
      console.error("loadAllData error:", err);
      injectGreetingMessage(null, []);
    } finally {
      setFinanceLoading(false);
    }
  };

  // ── greeting + proactive recurring prompt ─────────────────────────────────
  const injectGreetingMessage = (summary, recurring) => {
    const name = getUserName();
    const greeting = getGreeting();
    const nameStr = name ? `, ${name}` : "";

    let content = `${greeting}${nameStr}! 👋 I'm your AI finance assistant.\n\n`;
    let spokenText = `${greeting}${nameStr}! I'm your AI finance assistant. `;

    if (!summary || !summary.hasExpenses) {
      content += "Looks like you're just getting started! Add your first expense or income and I'll start giving you personalized insights.\n\nTry:\n• 'Add expense ₹500 food lunch'\n• 'Add income ₹25000 salary'";
      spokenText += "Looks like you are just getting started. Add your first expense or income and I will give you personalized insights.";
    } else {
      content += `Here's your financial snapshot 📊\n\n`;
      content += `💰 **Balance:** ₹${summary.balance.toLocaleString()}\n`;
      content += `📈 **Income:** ₹${summary.totalIncome.toLocaleString()} | 📉 **Spent:** ₹${summary.totalExpense.toLocaleString()}\n`;
      content += `💾 **Savings Rate:** ${summary.savingsRate}%`;

      spokenText += `Your balance is ${summary.balance.toLocaleString()} rupees. Savings rate is ${summary.savingsRate} percent. `;

      if (summary.topCategory) {
        content += `\n🔥 **Top spending:** ${summary.topCategory[0]} (₹${Number(summary.topCategory[1]).toLocaleString()})`;
        spokenText += `Top spending is ${summary.topCategory[0]}. `;
      }
      if (summary.totalChange !== null) {
        const dir = summary.totalChange > 0 ? "up" : "down";
        content += `\n📊 Spending **${summary.totalChange > 0 ? "↑" : "↓"}${Math.abs(summary.totalChange)}%** vs last month`;
        spokenText += `Spending is ${dir} ${Math.abs(summary.totalChange)} percent this month. `;
      }
      if (summary.overBudget.length > 0) {
        content += `\n\n⚠️ **Over budget:** ${summary.overBudget.map((b) => b.category).join(", ")}!`;
        spokenText += `Warning! Over budget in ${summary.overBudget.map((b) => b.category).join(" and ")}. `;
      } else if (summary.nearBudget.length > 0) {
        content += `\n\n🟡 **Near limit:** ${summary.nearBudget.map((b) => b.category).join(", ")}`;
        spokenText += `Getting close to budget limit in ${summary.nearBudget.map((b) => b.category).join(" and ")}. `;
      } else if (summary.budgets.length > 0) {
        content += `\n\n✅ All budgets on track!`;
        spokenText += `All budgets are on track! `;
      }
      content += `\n\nJust say **"add expense"** or **"add income"** and I'll do it for you!`;
      spokenText += "Just say add expense or add income and I will do it for you!";
    }

    const msgs = [{ role: "assistant", content, type: "greeting" }];

    // ── proactively ask about recurring transactions ───────────────────────
    if (recurring && recurring.length > 0) {
      const r = recurring[0]; // ask about the most frequent one
      const recurringMsg = {
        role: "assistant",
        type: "recurring_prompt",
        recurringItem: r,
        content: `🔄 I noticed **${r.title}** appears regularly in your expenses (₹${Number(r.amount).toLocaleString()} · ${r.category}).\n\nShould I add it again this month?`,
      };
      msgs.push(recurringMsg);
      setPendingRecurring(r);
      spokenText += `By the way, I noticed ${r.title} is a recurring expense. Should I add it again this month?`;
    }

    setMessages(msgs);
    setTimeout(() => speakWithIndicator(spokenText), 700);
  };

  // ── handle recurring YES / NO ─────────────────────────────────────────────
  const handleRecurringResponse = async (confirmed) => {
    if (!pendingRecurring) return;
    const r = pendingRecurring;
    setPendingRecurring(null);

    // remove the prompt card from messages
    setMessages((prev) => prev.filter((m) => m.type !== "recurring_prompt"));

    if (confirmed) {
      try {
        await addExpenseViaAPI(r.title, r.amount, r.category);
        const msg = `✅ Done! Added **${r.title}** — ₹${Number(r.amount).toLocaleString()} under **${r.category}** automatically!`;
        setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
        speakWithIndicator(`Done! Added ${r.title} for ${Number(r.amount).toLocaleString()} rupees automatically.`);
        setFinanceFetched(false);
      } catch {
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, couldn't add it. Please try again!" }]);
      }
    } else {
      const msg = `No problem! I won't add **${r.title}** this time. Let me know if you need anything! 😊`;
      setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
      speakWithIndicator(`No problem! I won't add ${r.title} this time.`);
    }
  };

  // ── voice input ────────────────────────────────────────────────────────────
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    stopSpeaking(); setIsSpeaking(false);
    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };
  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); };
  const toggleListening = () => { if (isListening) stopListening(); else startListening(); };

  // ── API helpers ────────────────────────────────────────────────────────────
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [expRes, incRes, budRes] = await Promise.all([
        axios.get("http://localhost:5000/api/expenses", { headers }),
        axios.get("http://localhost:5000/api/income", { headers }),
        axios.get("http://localhost:5000/api/budgets/status", { headers }),
      ]);
      return { expenses: expRes.data, income: incRes.data, budgets: budRes.data };
    } catch { return { expenses: [], income: [], budgets: [] }; }
  };

  const addExpenseViaAPI = async (title, amount, category) => {
    const token = localStorage.getItem("token");
    const res = await axios.post("http://localhost:5000/api/expenses", { title, amount: Number(amount), category, date: new Date() }, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  };

  const addIncomeViaAPI = async (source, amount) => {
    const token = localStorage.getItem("token");
    const res = await axios.post("http://localhost:5000/api/income", { source, amount: Number(amount), date: new Date() }, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  };

  // ── send message ───────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    stopSpeaking(); setIsSpeaking(false);
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const { expenses, income, budgets } = await fetchUserData();
      const totalIncome = income.reduce((s, i) => s + Number(i.amount), 0);
      const totalExpense = expenses.reduce((s, e) => s + Number(e.amount), 0);
      const balance = totalIncome - totalExpense;
      const categoryBreakdown = expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + Number(e.amount); return acc; }, {});
      const recentExpenses = expenses.slice(0, 5).map((e) => ({ title: e.title, amount: e.amount, category: e.category, date: new Date(e.date).toLocaleDateString() }));
      const recentIncome = income.slice(0, 5).map((i) => ({ source: i.source, amount: i.amount, date: new Date(i.date).toLocaleDateString() }));
      const recurringText = smartInsights?.recurring?.length > 0 ? smartInsights.recurring.map((r) => `- ${r.title}: ₹${r.amount} (${r.category})`).join("\n") : "None detected yet";
      const trendsText = smartInsights?.trends?.length > 0 ? smartInsights.trends.map((t) => `- ${t.category}: ${t.changePercent > 0 ? "↑ up" : "↓ down"} ${Math.abs(t.changePercent)}% vs last month`).join("\n") : "No significant changes";

      const systemPrompt = `You are a personal AI finance assistant for FinanceFlow. Be warm, proactive, and give personalized advice like a real financial advisor friend. You can directly add expenses and income for the user without them filling any form.

USER'S FINANCIAL DATA:
- Total Income: ₹${totalIncome.toLocaleString()}
- Total Expenses: ₹${totalExpense.toLocaleString()}
- Current Balance: ₹${balance.toLocaleString()}
- Savings Rate: ${totalIncome > 0 ? (((balance / totalIncome) * 100).toFixed(1)) : 0}%

EXPENSE BREAKDOWN BY CATEGORY:
${Object.entries(categoryBreakdown).map(([cat, amt]) => `- ${cat}: ₹${amt.toLocaleString()}`).join("\n") || "No expenses yet"}

RECENT EXPENSES (last 5):
${recentExpenses.map((e) => `- ${e.title}: ₹${e.amount} (${e.category}) on ${e.date}`).join("\n") || "No recent expenses"}

RECENT INCOME (last 5):
${recentIncome.map((i) => `- ${i.source}: ₹${i.amount} on ${i.date}`).join("\n") || "No recent income"}

BUDGET STATUS:
${budgets.map((b) => `- ${b.category}: Spent ₹${b.spent} of ₹${b.limit} (${Math.round(b.percentage)}%) - Status: ${b.status}`).join("\n") || "No budgets set"}

DETECTED RECURRING TRANSACTIONS:
${recurringText}

SPENDING TRENDS (this month vs last month):
${trendsText}

IMPORTANT INSTRUCTIONS:
1. If user wants to ADD AN EXPENSE (e.g. "spent 500 on food", "add transport 200", "zomato 350"), respond ONLY with this exact JSON (nothing else):
{"action":"add_expense","title":"<title>","amount":<number>,"category":"<Food|Transport|Shopping|Entertainment|Bills|Health|Education|Other>"}

2. If user wants to ADD INCOME (e.g. "got salary 25000", "received 5000 freelance"), respond ONLY with this exact JSON (nothing else):
{"action":"add_income","source":"<source>","amount":<number>}

3. For all other questions: respond naturally, friendly, concise. Use real data. Use ₹ symbol. Max 4-5 lines. Give actionable advice.

IMPORTANT: Detect expense/income intent even from casual language like "I paid 200 for auto", "bought groceries 800", "got paid today 30000".`;

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          systemPrompt,
          messages: [
            ...messages.filter((m) => m.role === "user" || (m.role === "assistant" && !m.type)).map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage },
          ],
        }),
      });

      const data = await response.json();
      const rawReply = data.content?.[0]?.text || "Sorry, I couldn't process that.";
      let finalReply = rawReply;

      try {
        const parsed = JSON.parse(rawReply.trim());
        if (parsed.action === "add_expense") {
          await addExpenseViaAPI(parsed.title, parsed.amount, parsed.category);
          finalReply = `✅ Done! Added expense:\n• **${parsed.title}** — ₹${Number(parsed.amount).toLocaleString()} under **${parsed.category}**\n\nNo form needed — I did it directly! 🎉`;

          // ── check if this is recurring and alert ──────────────────────────
          const existingTitles = (financeData?.expenses || []).map((e) => e.title.toLowerCase().trim());
          const isRecurring = existingTitles.filter((t) => t === parsed.title.toLowerCase().trim()).length >= 1;
          if (isRecurring) {
            finalReply += `\n\n🔄 By the way, **${parsed.title}** looks like a recurring expense for you!`;
          }

          setFinanceFetched(false);
          speakWithIndicator(`Done! Added ${parsed.title} for ${Number(parsed.amount).toLocaleString()} rupees under ${parsed.category}. No form needed!`);
        } else if (parsed.action === "add_income") {
          await addIncomeViaAPI(parsed.source, parsed.amount);
          finalReply = `✅ Done! Added income:\n• **${parsed.source}** — ₹${Number(parsed.amount).toLocaleString()}\n\nAdded directly — no form needed! 🎉`;
          setFinanceFetched(false);
          speakWithIndicator(`Done! Added income of ${Number(parsed.amount).toLocaleString()} rupees from ${parsed.source}.`);
        } else {
          // normal reply — speak it
          const cleanReply = finalReply.replace(/\*\*(.*?)\*\*/g, "$1").replace(/•/g, "").replace(/₹/g, "rupees ").replace(/\n/g, ". ");
          speakWithIndicator(cleanReply);
        }
      } catch {
        // not JSON — normal reply
        const cleanReply = finalReply.replace(/\*\*(.*?)\*\*/g, "$1").replace(/•/g, "").replace(/₹/g, "rupees ").replace(/\n/g, ". ");
        speakWithIndicator(cleanReply);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: finalReply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const formatMessage = (text) =>
    text.split("\n").map((line, i) => (
      <span key={i}>
        {line.split(/\*\*(.*?)\*\*/g).map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    ));

  // always-visible quick actions
  const quickActions = [
    { label: "💰 Balance?", msg: "What's my balance?" },
    { label: "📊 Budget?", msg: "Am I over budget?" },
    { label: "💡 Save tips", msg: "Where can I save money?" },
    { label: "🍔 Add food", msg: "Add expense ₹500 food lunch" },
    { label: "📈 Breakdown", msg: "Show spending breakdown" },
    { label: "🔄 Recurring?", msg: "Any recurring expenses?" },
  ];

  // ── Finance Summary Card ───────────────────────────────────────────────────
  const FinanceSummaryCard = () => {
    if (!financeData || !financeData.hasExpenses) return null;
    const { totalIncome, totalExpense, balance, savingsRate, totalThis } = financeData;
    const savingsNum = parseFloat(savingsRate);
    const savingsColor = savingsNum >= 20 ? "#10b981" : savingsNum >= 10 ? "#f59e0b" : "#ef4444";
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mx-4 mb-3 rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
        <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "rgba(102,126,234,0.2)" }}>
          <span className="text-sm">📊</span>
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Finance Summary</p>
        </div>
        <div className="grid grid-cols-3 gap-px p-0.5" style={{ background: "rgba(255,255,255,0.05)" }}>
          {[
            { label: "Income", value: `₹${totalIncome >= 1000 ? (totalIncome/1000).toFixed(1)+"k" : totalIncome}`, icon: "💚", color: "#10b981" },
            { label: "Spent", value: `₹${totalExpense >= 1000 ? (totalExpense/1000).toFixed(1)+"k" : totalExpense}`, icon: "🔴", color: "#ef4444" },
            { label: "Balance", value: `₹${Math.abs(balance) >= 1000 ? (balance/1000).toFixed(1)+"k" : balance}`, icon: "💰", color: balance >= 0 ? "#10b981" : "#ef4444" },
          ].map((s, i) => (
            <div key={i} className="py-3 px-2 text-center" style={{ background: "rgba(0,0,0,0.2)" }}>
              <p className="text-xs mb-1">{s.icon}</p>
              <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="px-4 py-2">
          <div className="flex justify-between items-center mb-1">
            <p className="text-white/50 text-xs">Savings Rate</p>
            <p className="text-xs font-bold" style={{ color: savingsColor }}>{savingsRate}%</p>
          </div>
          <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(savingsNum, 100)}%` }} transition={{ duration: 1, delay: 0.5 }}
              className="h-full rounded-full" style={{ background: savingsColor }} />
          </div>
        </div>
        {(totalThis > 0 || financeData.overBudget?.length > 0) && (
          <div className="px-4 pb-2 space-y-1">
            {totalThis > 0 && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
                <span className="text-white/60 text-xs">This month</span>
                <span className="text-white text-xs font-bold">₹{totalThis.toLocaleString()}</span>
              </div>
            )}
            {financeData.overBudget?.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(239,68,68,0.15)" }}>
                <span className="text-sm">⚠️</span>
                <p className="text-red-300 text-xs font-semibold">Over budget: {financeData.overBudget.map((b) => b.category).join(", ")}</p>
              </div>
            )}
            {financeData.overBudget?.length === 0 && financeData.nearBudget?.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(245,158,11,0.15)" }}>
                <span className="text-sm">🟡</span>
                <p className="text-amber-300 text-xs font-semibold">Near limit: {financeData.nearBudget.map((b) => b.category).join(", ")}</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  // ── Smart Insights Panel ───────────────────────────────────────────────────
  const SmartInsightsPanel = () => {
    if (!smartInsights) return null;
    const { recurring, trends, totalChange, hasComparison } = smartInsights;
    if (!hasComparison && trends.length === 0 && recurring.length === 0) return null;
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="mx-4 mb-3 rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(118,75,162,0.2)" }}>
          <span className="text-sm">🔍</span>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">I noticed this</p>
        </div>
        <div className="px-3 py-2 space-y-1.5">
          {hasComparison && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
              <span className="text-sm">{totalChange > 0 ? "📈" : "📉"}</span>
              <p className="text-white/80 text-xs">
                Spending <span className={`font-bold ${totalChange > 0 ? "text-red-400" : "text-emerald-400"}`}>{totalChange > 0 ? "↑" : "↓"}{Math.abs(totalChange)}%</span> vs last month
              </p>
            </div>
          )}
          {trends.slice(0, 2).map((t, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
              <span className="text-sm">{t.changePercent > 0 ? "⚠️" : "✅"}</span>
              <p className="text-white/80 text-xs">
                <span className="text-white font-semibold">{t.category}</span>{" "}
                <span className={`font-bold ${t.changePercent > 0 ? "text-red-400" : "text-emerald-400"}`}>{t.changePercent > 0 ? "↑" : "↓"}{Math.abs(t.changePercent)}%</span> this month
              </p>
            </div>
          ))}
          {recurring.length > 0 && (
            <div className="flex items-start gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
              <span className="text-sm mt-0.5">🔄</span>
              <div>
                <p className="text-white/50 text-xs mb-0.5">Recurring detected:</p>
                {recurring.map((r, i) => (
                  <p key={i} className="text-white/80 text-xs">• <span className="text-white font-semibold">{r.title}</span> — ₹{Number(r.amount).toLocaleString()}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-15 right-6 z-50 w-[380px] max-h-[680px] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/20"
            style={{ background: "linear-gradient(145deg, #0f0c29, #302b63, #24243e)" }}>

            {/* ── Header ── */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-white/10 flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                    style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>🤖</div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0f0c29]" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Finance AI</p>
                  {isSpeaking ? (
                    <div className="flex items-center gap-1.5">
                      {[0,1,2,3].map((i) => (
                        <motion.div key={i} animate={{ scaleY: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                          className="w-0.5 h-3 bg-emerald-400 rounded-full" />
                      ))}
                      <span className="text-emerald-400 text-xs ml-1">Speaking</span>
                      <button onClick={() => { stopSpeaking(); setIsSpeaking(false); }} className="text-white/30 hover:text-white/60 text-xs ml-1">■ stop</button>
                    </div>
                  ) : isListening ? (
                    <div className="flex items-center gap-1.5">
                      <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                      <span className="text-red-400 text-xs">Listening...</span>
                    </div>
                  ) : (
                    <p className="text-white/40 text-xs">{financeLoading ? "Analyzing finances..." : "Your personal advisor"}</p>
                  )}
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                onClick={() => { setIsOpen(false); stopSpeaking(); setIsSpeaking(false); stopListening(); }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">✕</motion.button>
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: "460px" }}>
              {financeLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mx-4 mt-4 mb-3 px-4 py-3 rounded-2xl flex items-center gap-3"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full flex-shrink-0" />
                  <p className="text-white/50 text-xs">Loading your financial data...</p>
                </motion.div>
              )}

              {!financeLoading && <FinanceSummaryCard />}
              {!financeLoading && <SmartInsightsPanel />}

              {/* Messages */}
              <div className="px-4 pt-1 pb-2 space-y-3">
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>

                    {/* ── Recurring prompt card ── */}
                    {msg.type === "recurring_prompt" ? (
                      <div className="w-full">
                        <div className="flex justify-start">
                          <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm mr-2 mt-0.5 flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>🤖</div>
                          <div className="max-w-[85%] rounded-2xl rounded-tl-sm overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)" }}>
                            <div className="px-4 py-3">
                              <p className="text-white/90 text-sm leading-relaxed">{formatMessage(msg.content)}</p>
                            </div>
                            {/* Yes / No buttons */}
                            <div className="flex border-t border-white/10">
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={() => handleRecurringResponse(true)}
                                className="flex-1 py-2.5 text-sm font-bold text-emerald-400 hover:bg-emerald-400/10 transition-all flex items-center justify-center gap-1">
                                ✅ Yes, add it
                              </motion.button>
                              <div className="w-px bg-white/10" />
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={() => handleRecurringResponse(false)}
                                className="flex-1 py-2.5 text-sm font-bold text-red-400 hover:bg-red-400/10 transition-all flex items-center justify-center gap-1">
                                ❌ No, skip
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {msg.role === "assistant" && (
                          <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm mr-2 mt-0.5 flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>🤖</div>
                        )}
                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "text-white rounded-tr-sm" : "text-white/90 rounded-tl-sm"}`}
                          style={{ background: msg.role === "user" ? "linear-gradient(135deg, #667eea, #764ba2)" : "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)" }}>
                          {formatMessage(msg.content)}
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}

                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm mr-2 flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>🤖</div>
                    <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="flex gap-1.5 items-center h-4">
                        {[0,1,2].map((i) => (
                          <motion.div key={i} animate={{ y: [0,-4,0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i*0.15 }}
                            className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* ── ALWAYS VISIBLE Quick Actions ── */}
            <div className="px-4 py-2 border-t border-white/10 flex-shrink-0" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-white/25 text-xs mb-1.5">Quick actions</p>
              <div className="flex flex-wrap gap-1.5">
                {quickActions.map((action, i) => (
                  <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setInput(action.msg)}
                    className="text-xs px-2.5 py-1 rounded-full text-white/65 hover:text-white transition-all border border-white/10 hover:border-white/30"
                    style={{ background: "rgba(255,255,255,0.05)" }}>
                    {action.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── Input area ── */}
            <div className="p-3 border-t border-white/10 flex-shrink-0" style={{ background: "rgba(255,255,255,0.03)" }}>
              <AnimatePresence>
                {isListening && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="mb-2 px-3 py-2 rounded-xl flex items-center gap-2" style={{ background: "rgba(239,68,68,0.15)" }}>
                    <motion.div animate={{ scale: [1,1.5,1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 bg-red-400 rounded-full" />
                    <p className="text-red-300 text-xs">Listening... say: "Add Zomato 250 rupees food"</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2 items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? "🎤 Listening..." : "Say or type to add expense..."}
                  rows={1}
                  className="flex-1 bg-white/10 text-white placeholder-white/30 rounded-2xl px-4 py-2.5 text-sm resize-none outline-none border border-white/10 focus:border-white/30 transition-all"
                  style={{ maxHeight: "80px" }}
                />

                {voiceSupported && (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={toggleListening}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all relative overflow-hidden"
                    style={{ background: isListening ? "linear-gradient(135deg, #ef4444, #dc2626)" : "rgba(255,255,255,0.1)", border: isListening ? "none" : "1px solid rgba(255,255,255,0.15)" }}>
                    {isListening && (
                      <motion.div animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 rounded-2xl bg-red-500" />
                    )}
                    <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24"
                      style={{ color: isListening ? "white" : "rgba(255,255,255,0.55)" }}>
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z"/>
                    </svg>
                  </motion.button>
                )}

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleSend} disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all"
                  style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </motion.button>
              </div>

              <div className="flex items-center justify-center gap-2 mt-1.5">
                <p className="text-white/20 text-xs">Powered by Groq AI</p>
                {voiceSupported && <p className="text-white/15 text-xs">• 🎤 Voice enabled</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl"
        style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", boxShadow: "0 8px 32px rgba(102, 126, 234, 0.5)" }}>
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="text-white text-xl font-bold">✕</motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="text-2xl">🤖</motion.span>
          )}
        </AnimatePresence>
        {!isOpen && (
          <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }} />
        )}
      </motion.button>
    </>
  );
}