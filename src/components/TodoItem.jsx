// comment

import React, { useState } from "react";

export default function TodoItem({ todo, deleteTodo, editTodo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleSave = () => {
    if (editText.trim() === "") return;
    editTodo(todo.id, editText.trim());
    setIsEditing(false);
  };

  return (
    <li className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border-l-4 border-pink-300 px-4 py-3 mb-2 rounded-xl shadow-sm transition hover:shadow-md">
  {isEditing ? (
    <input
      type="text"
      value={editText}
      onChange={(e) => setEditText(e.target.value)}
      className="flex-grow border border-purple-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
    />
  ) : (
    <span className="text-lg font-medium text-gray-800 hover:text-purple-600 transition">{todo.text}</span>
  )}

  <div className="mt-2 sm:mt-0 sm:ml-4 space-x-3">
    {isEditing ? (
      <>
        <button
          onClick={handleSave}
          className="text-white bg-green-500 px-4 py-1 rounded-md hover:bg-green-600 transition"
        >
          Save
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="text-gray-600 bg-gray-200 px-4 py-1 rounded-md hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </>
    ) : (
      <>
        <button
          onClick={() => setIsEditing(true)}
          className="text-blue-600 font-semibold hover:underline"
        >
          Edit
        </button>
        <button
          onClick={() => deleteTodo(todo.id)}
          className="text-red-500 font-semibold hover:underline"
        >
          Delete
        </button>
      </>
    )}
  </div>
</li>
  );
}
