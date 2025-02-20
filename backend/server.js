require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Define the To-Do Schema
const TodoSchema = new mongoose.Schema({
  task: String,
  email: String, // ✅ Associate tasks with the user
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  createdAt: { type: Date, default: Date.now },
});

const Todo = mongoose.model("Todo", TodoSchema);

// Function to interact with Gemini AI
async function processWithGemini(prompt) {
  try {
    const aiPrompt = `
You are an AI-powered task manager. Respond in a structured format.

For creating tasks:
**Task Name:** [Task Name]
**Priority:** [Low/Medium/High]
**Action:** Create

For updating tasks:
**Old Task Name:** [Existing Task] (or keyword)
**New Task Name:** [Updated Task] (if applicable)
**Priority:** [Updated Priority] (if applicable)
**Action:** Update

For marking completion:
**Task Name:** [Task Name]
**Completion Status:** [Completed/Not Completed]
**Action:** Mark Completion

For deleting tasks:
**Task Name:** [Task Name] (if applicable)
**Action:** Delete

For listing tasks:
**Filter:** [All/Completed/Not Completed/High Priority/Medium Priority/Low Priority]
**Action:** List

User Request: "${prompt}"
    `;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: aiPrompt }] }] },
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.data?.candidates?.length > 0) {
      return response.data.candidates[0].content;
    } else {
      throw new Error("No meaningful response from AI");
    }
  } catch (error) {
    console.error(
      "❌ Error with Gemini API:",
      error.response?.data || error.message
    );
    return null;
  }
}

// 🔹 **Analyze AI Response**
function determineAction(aiResponse) {
  const aiText = aiResponse?.parts?.[0]?.text?.trim().toLowerCase() || "";
  if (!aiText) return "unknown";

  console.log("🔍 Processed AI Response:", aiText);

  if (aiText.includes("**action:** create")) return "create";
  if (aiText.includes("**action:** update")) return "update";
  if (aiText.includes("**action:** delete")) return "delete";
  if (aiText.includes("**action:** list")) return "list";
  if (
    aiText.includes("**action:** mark completion") ||
    aiText.includes("**completion status:**")
  )
    return "complete";

  return "unknown";
}

// 🔹 **Create Task**
async function createTask(aiText, res) {
  const { email } = res.req.body;
  if (!email) return res.status(400).json({ error: "User email is required" });

  const taskMatch = aiText.match(/\*\*task name:\*\* (.+)/i);
  const priorityMatch = aiText.match(/\*\*priority:\*\* (low|medium|high)/i);
  if (!taskMatch)
    return res.status(400).json({ error: "Could not determine task details" });

  const task = taskMatch[1].trim();
  const priority = priorityMatch
    ? priorityMatch[1].trim().toLowerCase()
    : "medium";

  const newTodo = new Todo({ task, priority, email });
  await newTodo.save();
  return res.json({ message: "✅ Task Created", task, priority });
}

// 🔹 **Update Task**
async function updateTask(aiText, res) {
  const { email } = res.req.body;
  if (!email) return res.status(400).json({ error: "User email is required" });

  const oldTaskMatch = aiText.match(/\*\*old task name:\*\* (.+)/i);
  const newTaskMatch = aiText.match(/\*\*new task name:\*\* (.+)/i);
  const priorityMatch = aiText.match(/\*\*priority:\*\* (low|medium|high)/i);

  if (!oldTaskMatch)
    return res
      .status(400)
      .json({ error: "Could not determine update details" });

  const oldTask = oldTaskMatch[1].trim();
  const newTask = newTaskMatch ? newTaskMatch[1].trim() : null;
  const newPriority = priorityMatch
    ? priorityMatch[1].trim().toLowerCase()
    : null;

  // Fetch the existing task first to prevent accidental overwrites
  const existingTask = await Todo.findOne({
    email,
    task: { $regex: new RegExp(`^${oldTask}$`, "i") },
  });

  if (!existingTask) {
    return res.status(404).json({ error: `Task "${oldTask}" not found` });
  }

  // Prepare update fields without overwriting existing values unnecessarily
  const updateFields = {};
  if (newTask) updateFields.task = newTask;
  if (newPriority) updateFields.priority = newPriority;

  // Apply updates
  const updatedTask = await Todo.findOneAndUpdate(
    { email, task: existingTask.task }, // Use existing task name to prevent case mismatch
    { $set: updateFields },
    { new: true }
  );

  return updatedTask
    ? res.json({
        message: `✏️ Task updated: "${updatedTask.task}" | Priority: "${updatedTask.priority}"`,
      })
    : res.status(500).json({ error: "Failed to update task" });
}

// 🔹 **Delete Task**
async function deleteTask(aiText, res) {
  const { email } = res.req.body;
  if (!email) return res.status(400).json({ error: "User email is required" });

  const taskMatch = aiText.match(/\*\*task name:\*\* (.+)/i);
  if (!taskMatch)
    return res.status(400).json({ error: "Could not determine task details" });

  const task = taskMatch[1].trim();
  const deleted = await Todo.findOneAndDelete({ email, task });

  return deleted
    ? res.json({ message: `🗑️ Task "${task}" deleted successfully.` })
    : res.status(404).json({ error: `Task "${task}" not found.` });
}

// 🔹 **Mark Task as Completed**
async function markTaskCompletion(aiText, res) {
  const { email } = res.req.body;
  if (!email) return res.status(400).json({ error: "User email is required" });

  const taskMatch = aiText.match(/\*\*task name:\*\* (.+)/i);
  const statusMatch = aiText.match(
    /\*\*completion status:\*\* (completed|not completed)/i
  );

  if (!taskMatch || !statusMatch)
    return res
      .status(400)
      .json({ error: "Could not determine task completion details" });

  const task = taskMatch[1].trim();
  const status = statusMatch[1].trim().toLowerCase();

  const updated = await Todo.findOneAndUpdate(
    { email, task },
    { status },
    { new: true }
  );

  return updated
    ? res.json({ message: `✅ Task "${task}" marked as ${status}.` })
    : res.status(404).json({ error: `Task "${task}" not found.` });
}

// 🔹 **List Tasks (Now Strictly Filters by User Email)**
async function listTasks(aiText, res) {
  const { email } = res.req.body;
  if (!email) return res.status(400).json({ error: "User email is required" });

  let filter = { email };

  if (/\*\*filter:\*\* high priority/i.test(aiText)) filter.priority = "high";
  else if (/\*\*filter:\*\* medium priority/i.test(aiText))
    filter.priority = "medium";
  else if (/\*\*filter:\*\* low priority/i.test(aiText))
    filter.priority = "low";

  if (/\*\*filter:\*\* completed/i.test(aiText)) filter.status = "completed";
  else if (
    /\*\*filter:\*\* not completed/i.test(aiText) ||
    /\*\*filter:\*\* pending/i.test(aiText)
  )
    filter.status = "pending";

  console.log(`🔍 Filtering Tasks with: ${JSON.stringify(filter)}`);

  const todos = await Todo.find(filter).sort({ createdAt: -1 });

  return res.json({
    message: "📝 Todo List",
    todos: todos.length > 0 ? todos : [], // Ensure empty array instead of 404
  });
}

// 🔹 **Handle AI-Based Actions (Ensuring One Action at a Time)**
app.post("/todo-ai", async (req, res) => {
  try {
    const { prompt, email } = req.body;
    if (!prompt || !email) {
      return res
        .status(400)
        .json({ error: "❌ Missing prompt or user email." });
    }

    // ✅ Process AI Response
    const aiResponse = await processWithGemini(prompt);
    if (!aiResponse)
      return res.status(500).json({ error: "❌ AI Processing failed." });

    console.log("🧠 AI Response:", aiResponse);

    const aiText = aiResponse?.parts?.[0]?.text?.trim() || "";
    if (!aiText)
      return res
        .status(500)
        .json({ error: "❌ AI returned an empty response." });

    const action = determineAction(aiResponse);
    console.log(`🔍 Detected Action: ${action}`);

    // ✅ Execute Only One Action at a Time
    switch (action) {
      case "create":
        return createTask(aiText, res);
      case "update":
        return updateTask(aiText, res);
      case "delete":
        return deleteTask(aiText, res);
      case "list":
        return listTasks(aiText, res);
      case "complete":
        return markTaskCompletion(aiText, res);
      default:
        console.log("⚠️ AI response did not match any known action.");
        return res
          .status(400)
          .json({ error: "❌ Invalid AI action detected." });
    }
  } catch (error) {
    console.error("❌ Error in processing AI request:", error.message);
    return res.status(500).json({ error: "❌ Internal Server Error." });
  }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
