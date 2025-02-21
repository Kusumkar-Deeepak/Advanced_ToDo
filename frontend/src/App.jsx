import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "https://smarttasker-server.onrender.com/todo-ai";

function App() {
  const [prompt, setPrompt] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [showPopup, setShowPopup] = useState(user === null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Fetch tasks from backend based on logged-in user
  const fetchTasks = async (userEmail) => {
    if (!userEmail) return; // Ensure email is provided before making a request

    try {
      setLoading(true);
      const response = await axios.post(API_URL, {
        prompt: "List all tasks",
        email: userEmail,
      });

      if (response.data && response.data.todos) {
        setTasks(response.data.todos);
      } else {
        setTasks([]); // Ensure an empty task list instead of throwing an error
      }
    } catch (error) {
      console.error(
        "Error fetching tasks:",
        error.response?.data || error.message
      );

      if (error.response && error.response.status === 404) {
        setTasks([]); // Handle empty response properly
      } else {
        toast.error(
          "⚠️ Error fetching tasks: " +
            (error.response?.data?.error || error.message)
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle user login & save credentials to localStorage
  const handleLogin = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("⚠️ Please enter a valid name and email.");
      return;
    }
    const userData = { name, email };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setShowPopup(false);
    fetchTasks(email);
  };

  // Logout and clear stored user data
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setShowPopup(true);
    setTasks([]);
  };

  // Fetch tasks when the user logs in
  useEffect(() => {
    if (user) {
      fetchTasks(user.email);
    }
  }, [user]);

  // Handle AI Prompt Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      const response = await axios.post(API_URL, { prompt, email: user.email });
      toast.success(response.data.message);
      setPrompt("");
      fetchTasks(user.email);
    } catch (error) {
      toast.error(
        "❌ AI Processing failed: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-5">
      {/* Title & Logout Section */}
      <div className="flex justify-between items-center w-full max-w-4xl mx-auto py-3">
        <h1 className="text-3xl font-bold">🚀 AI-Powered To-Do App</h1>
        {user && (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition duration-300"
          >
            Logout
          </button>
        )}
      </div>

      {/* User Authentication Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-center">
            <h2 className="text-lg font-bold mb-3">Enter Your Details</h2>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-600 bg-gray-700 rounded mb-3 focus:ring focus:ring-blue-400"
            />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-600 bg-gray-700 rounded mb-3 focus:ring focus:ring-blue-400"
            />
            <button
              onClick={handleLogin}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition duration-300"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* AI Prompt Form */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-3 w-full max-w-md mx-auto mt-6"
      >
        <input
          type="text"
          placeholder="Enter AI prompt (e.g., 'Create a task for...')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-3 border border-gray-600 bg-gray-700 rounded-lg focus:ring focus:ring-blue-400"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition duration-300"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {/* Task List */}
      <div className="mt-6 w-full max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-3">📝 Your Tasks</h2>
        {loading ? (
          <p className="text-gray-400">Loading tasks...</p>
        ) : tasks.length > 0 ? (
          <ul className="space-y-3">
            {tasks.map((task, index) => (
              <li
                key={index}
                className={`bg-gray-800 p-4 rounded-lg shadow-md transition duration-300 ${
                  task.status === "completed" ? "opacity-60 line-through" : ""
                }`}
              >
                <span className="text-lg font-semibold">{task.task}</span>
                <div className="text-sm text-gray-400 mt-1">
                  <span className="bg-gray-700 px-2 py-1 rounded-lg">
                    {task.priority.toUpperCase()} Priority
                  </span>{" "}
                  -{" "}
                  <span
                    className={`${
                      task.status === "completed"
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {task.status === "completed"
                      ? "✅ Completed"
                      : "⏳ Not Completed"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-center">No tasks available.</p>
        )}
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;
