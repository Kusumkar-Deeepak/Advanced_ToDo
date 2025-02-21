import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Documentation from "./Documentation"; // Import Documentation Component
import React from "react";
import Tasks from "./Tasks";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Tasks />} />
        <Route path="/documentation" element={<Documentation />} />
      </Routes>
    </Router>
  );
};

export default App;
