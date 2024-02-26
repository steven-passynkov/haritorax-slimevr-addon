import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Bluetooth from "./pages/Bluetooth";
import Navbar from "./components/Navbar";

// put bluetooth conect here and so as server so on any page it is working

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/bluetooth" element={<Bluetooth />} />
      </Routes>
    </Router>
  );
};

export default App;