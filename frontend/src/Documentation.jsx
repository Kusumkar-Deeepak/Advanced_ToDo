import { Link } from "react-router-dom";

function Documentation() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-6">
        📖 AI-Powered To-Do App Documentation
      </h1>

      {/* Introduction */}
      <section className="w-full max-w-3xl bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold mb-2">1️⃣ Introduction</h2>
        <p className="text-gray-300">
          The <strong>AI-Powered To-Do App</strong> is an intelligent task
          management system that helps users efficiently manage their daily
          tasks using AI-based natural language processing. You can **create,
          update, delete, mark tasks as completed, and filter tasks** using
          simple **text-based commands**.
        </p>
      </section>

      {/* Why Use This App */}
      <section className="w-full max-w-3xl bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold mb-2">2️⃣ Why Use This App?</h2>
        <ul className="list-disc pl-6 text-gray-300">
          <li>
            ✔️ **AI-Powered Task Management** – Enter text commands and let AI
            handle task processing.
          </li>
          <li>
            ✔️ **Personalized Experience** – Tasks are stored per user email,
            ensuring data privacy.
          </li>
          <li>
            ✔️ **Smart Filtering** – Easily filter tasks by **priority (High,
            Medium, Low)** or **status (Completed, Not Completed)**.
          </li>
          <li>
            ✔️ **Secure Database Storage** – Tasks are persistently stored in
            **MongoDB**, ensuring reliability.
          </li>
          <li>
            ✔️ **User-Friendly Interface** – A simple, elegant UI designed for a
            seamless task management experience.
          </li>
          <li>
            ✔️ **Cross-Device Compatibility** – Works on **Mobile, Tablet, and
            Desktop** for convenience.
          </li>
        </ul>
      </section>

      {/* How to Use the App */}
      <section className="w-full max-w-3xl bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold mb-2">3️⃣ How to Use the App</h2>
        <p className="text-gray-300">
          Using the app is simple! Just enter commands in **natural language**,
          and AI will process them automatically.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">🔹 Step 1: Login</h3>
        <ul className="list-disc pl-6 text-gray-300">
          <li>Enter your **name** and **email** when prompted.</li>
          <li>
            Your credentials are stored **locally** for a seamless experience.
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">
          🔹 Step 2: Add a Task
        </h3>
        <ul className="list-disc pl-6 text-gray-300">
          <li>
            Use a command like:{" "}
            <code>"Create a task for buying groceries at 6 PM"</code>.
          </li>
          <li>The AI will **automatically process** and save your task.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">
          🔹 Step 3: Update a Task
        </h3>
        <ul className="list-disc pl-6 text-gray-300">
          <li>
            To rename a task:{" "}
            <code>
              "Update the task 'Submit report' to 'Submit final report'"
            </code>
            .
          </li>
          <li>
            To change priority:{" "}
            <code>"Update priority of 'Meeting' to high"</code>.
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">
          🔹 Step 4: Delete a Task
        </h3>
        <ul className="list-disc pl-6 text-gray-300">
          <li>
            To delete a task: <code>"Delete the task 'Buy groceries'"</code>.
          </li>
          <li>
            To remove all completed tasks:{" "}
            <code>"Delete all completed tasks"</code>.
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">
          🔹 Step 5: View Tasks
        </h3>
        <ul className="list-disc pl-6 text-gray-300">
          <li>
            To list all tasks: <code>"Show all tasks"</code>.
          </li>
          <li>
            To filter by priority: <code>"Show all high-priority tasks"</code>.
          </li>
          <li>
            To filter by status: <code>"Show all completed tasks"</code>.
          </li>
        </ul>
      </section>

      {/* Examples */}
      <section className="w-full max-w-3xl bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold mb-2">4️⃣ Examples</h2>
        <p className="text-gray-300">Try using the following prompts:</p>
        <ul className="list-disc pl-6 text-gray-300">
          <li>
            📌 <code>"Create a task for 'Call the doctor' at 10 AM"</code>
          </li>
          <li>
            📌{" "}
            <code>"Update the task 'Meeting' to 'Team Meeting at 3 PM'"</code>
          </li>
          <li>
            📌 <code>"Mark the task 'Submit report' as completed"</code>
          </li>
          <li>
            📌 <code>"Delete the task 'Go to gym'"</code>
          </li>
        </ul>
      </section>

      {/* Future Updates */}
      <section className="w-full max-w-3xl bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold mb-2">5️⃣ Future Updates</h2>
        <p className="text-gray-300">
          We are continuously working on new features! Upcoming updates include:
        </p>
        <ul className="list-disc pl-6 text-gray-300">
          <li>
            ✅ **More AI Capabilities** – Support for **multiple commands** in a
            single request.
          </li>
          <li>
            ✅ **Recurring Tasks** – Set tasks to repeat daily, weekly, or
            monthly.
          </li>
          <li>
            ✅ **Voice Commands** – Add and manage tasks using voice input.
          </li>
          <li>
            ✅ **Mobile App Version** – Dedicated mobile app for Android & iOS.
          </li>
        </ul>
      </section>

      {/* Developer Information */}
      <section className="w-full max-w-3xl bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold mb-2">
          6️⃣ Developer Information
        </h2>
        <p className="text-gray-300">
          The AI-Powered To-Do App was developed by **Deepak Kusumkar**, a
          passionate full-stack developer.
        </p>
        <ul className="list-disc pl-6 text-gray-300">
          <li>👨‍💻 **Developer:** Deepak Kusumkar</li>
          <li>
            📧 **Email:**{" "}
            <a
              href="mailto:deeepak.kusumkar@gmail.com"
              className="text-blue-400 hover:underline"
            >
              deeepak.kusumkar@gmail.com
            </a>
          </li>
          <li>
            🔗 **GitHub:**{" "}
            <a
              href="https://github.com/Kusumkar-Deeepak"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Kusumkar-Deeepak
            </a>
          </li>
          <li>
            🔗 **LinkedIn:**{" "}
            <a
              href="https://www.linkedin.com/in/deepak-kusumkar-36776729a/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Deepak Kusumkar
            </a>
          </li>
        </ul>
      </section>

      {/* Back to Home Button */}
      <Link
        to="/"
        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition duration-300"
      >
        🔙 Back to Home
      </Link>
    </div>
  );
}

export default Documentation;
