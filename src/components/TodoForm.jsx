// TodoForm.jsx
import React, { useState } from "react";

export default function TodoForm({ addTodo }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    addTodo(input.trim());
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
  <input
    type="text"
    className="flex-grow border-2 border-pink-300 bg-pink-50 text-gray-800 rounded-xl px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
    placeholder="Add a fabulous new todo..."
    value={input}
    onChange={(e) => setInput(e.target.value)}
  />
  <button
    type="submit"
    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-xl font-semibold shadow-md hover:from-pink-600 hover:to-purple-600 transition"
  >
    Add
  </button>
</form>
  );
}
