import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/admin-users"; // Backend endpoint to fetch users

function AdminPage() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Retrieve user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // Redirect if not an admin
  useEffect(() => {
    if (!user || user.email.toLowerCase() !== "deepak@gmail.com") {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch all accessed users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(API_URL);
        setUsers(response.data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-5 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">🔑 Admin Panel</h1>
      <h2 className="text-lg font-semibold">Accessed Users</h2>

      <div className="w-full max-w-lg mt-4 bg-gray-800 p-4 rounded-lg shadow-lg">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2 px-4">#</th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Email</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.email}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-400">
                  No users have accessed the website yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => navigate("/")}
        className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition duration-300"
      >
        🔙 Back to Dashboard
      </button>
    </div>
  );
}

export default AdminPage;
