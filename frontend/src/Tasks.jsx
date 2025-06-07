import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiPlus, FiTrash2, FiEdit, FiCheck, FiLogOut, FiUser, FiList } from 'react-icons/fi';

const API_URL = import.meta.env.REACT_APP_API_URL || 'https://smarttasker-server.onrender.com/api/tasks/ai';

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
};

const statusIcons = {
  pending: '⏳',
  completed: '✅'
};

const TaskManager = () => {
  const [state, setState] = useState({
    prompt: '',
    tasks: [],
    loading: false,
    user: JSON.parse(localStorage.getItem('user')) || null,
    authForm: { name: '', email: '' },
    activeTab: 'all',
    isMobileMenuOpen: false
  });

  const { prompt, tasks, loading, user, authForm, activeTab, isMobileMenuOpen } = state;

  // Memoized fetch function
  const fetchTasks = useCallback(async () => {
    if (!user?.email) return;

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { data } = await axios.post(API_URL, {
        prompt: `List ${activeTab === 'all' ? 'all' : activeTab} tasks`,
        email: user.email
      });

      // Make sure to handle the response structure correctly
      setState(prev => ({
        ...prev,
        tasks: data.data?.tasks || data.data || [],
        loading: false
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch tasks');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user?.email, activeTab]);

  // Effect for initial load and tab changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      authForm: {
        ...prev.authForm,
        [name]: value
      }
    }));
  };

  const handleLogin = async () => {
    if (!authForm.name.trim() || !authForm.email.trim()) {
      toast.error('Please enter valid credentials');
      return;
    }

    const userData = {
      name: authForm.name.trim(),
      email: authForm.email.trim().toLowerCase()
    };

    localStorage.setItem('user', JSON.stringify(userData));
    setState(prev => ({
      ...prev,
      user: userData,
      authForm: { name: '', email: '' }
    }));
    toast.success(`Welcome, ${userData.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setState(prev => ({
      ...prev,
      user: null,
      tasks: []
    }));
    toast.info('Logged out successfully');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || !user?.email) return;

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { data } = await axios.post(API_URL, {
        prompt: prompt.trim(),
        email: user.email
      });

      toast.success(data.message || 'Action completed');
      setState(prev => ({ ...prev, prompt: '' }));
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'AI processing failed');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return task.status === 'completed';
    if (activeTab === 'pending') return task.status === 'pending';
    return task.priority === activeTab;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600 flex items-center">
            <FiList className="mr-2" />
            SmartTask AI
          </h1>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline text-sm font-medium">
                Welcome, {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
              >
                <FiLogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!user ? (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Sign In</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={authForm.name}
                  onChange={handleAuthChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={authForm.email}
                  onChange={handleAuthChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="john@example.com"
                />
              </div>
              <button
                onClick={handleLogin}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 flex items-center justify-center"
              >
                <FiUser className="mr-2" />
                Continue
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* AI Prompt Form */}
            <div className="max-w-3xl mx-auto mb-8">
              <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                  <input
                    type="text"
                    name="prompt"
                    value={prompt}
                    onChange={handleInputChange}
                    placeholder="Tell me what to do (e.g., 'Create a high priority task for project deadline')"
                    className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center disabled:opacity-50"
                  >
                    <FiPlus className="mr-2" />
                    {loading ? 'Processing...' : 'Add Task'}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Examples: "Complete the report by Friday", "Change 'meeting' to 'team sync'", 
                  "Show me all high priority tasks"
                </p>
              </form>
            </div>

            {/* Task Filters */}
            <div className="max-w-3xl mx-auto mb-6 overflow-x-auto">
              <div className="flex space-x-2 pb-2">
                {['all', 'pending', 'completed', 'high', 'medium', 'low'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setState(prev => ({ ...prev, activeTab: tab }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Task List */}
            <div className="max-w-3xl mx-auto">
              {loading && !tasks.length ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : filteredTasks.length > 0 ? (
                <ul className="space-y-3">
                  {filteredTasks.map((task) => (
                    <li
                      key={task._id}
                      className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                            {task.task}
                          </h3>
                          <div className="mt-2 flex items-center space-x-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                              {task.priority} priority
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <p className="text-gray-500">
                    {activeTab === 'all'
                      ? "You don't have any tasks yet. Add one above!"
                      : `No ${activeTab} tasks found`}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} SmartTask AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default TaskManager;