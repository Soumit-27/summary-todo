const express = require("express");
const cors = require("cors");
const axios = require("axios");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
app.use(cors()); // Allow all origins (or restrict to http://localhost:5173)
app.use(express.json());

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://tkqnieipdondjrbkxubz.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrcW5pZWlwZG9uZGpyYmt4dWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjQxMTgsImV4cCI6MjA2MzYwMDExOH0.qGme1QA-Aw5YkOo83NSYodayyJ9Gy4JUFUhoCB5qe_A";
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Your Slack webhook URL
const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

// In-memory store for todos
let todos = [];
let nextId = 1;

// ─── CRUD ROUTES ───

// GET /todos – return all todos
// GET /todos – fetch all todos
app.get("/todos", async (req, res) => {
  const { data, error } = await supabase.from("todos").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /todos – add a new todo
app.post("/todos", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  const { data, error } = await supabase
    .from("todos")
    .insert([{ text }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT /todos/:id – update a todo
app.put("/todos/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { text } = req.body;

  const { data, error } = await supabase
    .from("todos")
    .update({ text })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(404).json({ error: "Todo not found" });
  res.json(data);
});

// DELETE /todos/:id – delete a todo
app.delete("/todos/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { error } = await supabase.from("todos").delete().eq("id", id);

  if (error) return res.status(500).json({ error: error.message });
  res.sendStatus(204);
});

// ─── SUMMARIZE ROUTE ───

// POST /summarize – summarize given todos and send to Slack
// app.post("/summarize", async (req, res) => {
//   try {
//     const todosFromClient = req.body.todos;
//     if (!Array.isArray(todosFromClient) || todosFromClient.length === 0) {
//       return res.status(400).json({ error: "No todos provided" });
//     }

//     // Build prompt
//     const todoList = todosFromClient.map(t => `- ${t.text}`).join("\n");
//     const prompt = `Summarize the following todos:\n${todoList}`;

//     // Call OpenAI
//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         { role: "system", content: "You are a helpful assistant." },
//         { role: "user", content: prompt },
//       ],
//       max_tokens: 150,
//     });

//     const summary = completion.choices[0].message.content.trim();

//     // Post to Slack
//     await axios.post(slackWebhookUrl, { text: summary });

//     res.json({ success: true, summary });
//   } catch (error) {
//     console.error("Summarize error:", error.response?.data || error.message);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post("/summarize", async (req, res) => {
  try {
    const todosFromClient = req.body.todos;
    if (!Array.isArray(todosFromClient) || todosFromClient.length === 0) {
      return res.status(400).json({ error: "No todos provided" });
    }

    const todoList = todosFromClient.map((t) => `- ${t.text}`).join("\n");
    const prompt = `Summarize the following todos:\n${todoList}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    // Post to Slack
    await axios.post(process.env.SLACK_WEBHOOK_URL, { text: summary });

    res.json({ success: true, summary });
  } catch (error) {
    console.error("Summarize error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── START SERVER ───

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
