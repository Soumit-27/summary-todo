// TodoList.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");


  const colors = ["text-red-600", "text-blue-600", "text-green-600", "text-yellow-600"];


  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = () => {
    axios
      .get("http://localhost:5000/todos")
      .then((res) => setTodos(res.data))
      .catch((err) => console.error(err));
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;

    axios
      .post("http://localhost:5000/todos", { text: newTodo })
      .then((res) => {
        setTodos([...todos, res.data]);
        setNewTodo("");
      })
      .catch((err) => console.error(err));
  };

  const deleteTodo = (id) => {
    axios
      .delete(`http://localhost:5000/todos/${id}`)
      .then(() => {
        setTodos(todos.filter((todo) => todo.id !== id));
      })
      .catch((err) => console.error(err));
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = (id) => {
    if (!editingText.trim()) return;

    axios
      .put(`http://localhost:5000/todos/${id}`, { text: editingText })
      .then((res) => {
        setTodos(todos.map((todo) => (todo.id === id ? res.data : todo)));
        setEditingId(null);
        setEditingText("");
      })
      .catch((err) => console.error(err));
  };

  const summarizeTodos = async () => {
    try {
      const response = await axios.post("http://localhost:5000/summarize", {
        todos: todos,
      });
      alert("Summary sent to Slack:\n\n" + response.data.summary);
    } catch (error) {
      alert("Failed to summarize todos: " + error.message);
      console.error(error);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        MY TODO
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="flex-grow border-2 border-yellow-300 bg-yellow-50 rounded-xl px-4 py-2 shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="What will you conquer next?"
        />
        <button
          onClick={addTodo}
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-semibold px-6 py-2 rounded-xl shadow-md hover:from-yellow-500 hover:to-yellow-600 transition"
        >
          Add
        </button>
      </div>

      <ul className="space-y-3">
        {todos.map((todo, index) => (
          
          <li key={todo.id} className="flex justify-between items-center mb-2">
            
            {editingId === todo.id ? (
              <>
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="border border-purple-300 px-3 py-2 rounded-md flex-grow mr-2"
                />
                <button
                  onClick={() => saveEdit(todo.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-green-600 transition"
                >
                  Save
                </button>
                <button
                  onClick={cancelEditing}
                  className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className={`font-medium ${colors[index % colors.length]}`}>
                  {todo.text}
                </span>
                <div  className="flex space-x-3">
                  <button
                  onClick={() => startEditing(todo)}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md shadow hover:bg-blue-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md shadow hover:bg-red-600 transition"
                >
                  Delete
                </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <button
        onClick={summarizeTodos}
        className="mt-8 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 transition text-lg"
      >
        ✨ Summarize Todos
      </button>
    </div>
  );
}
