import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ReviewProvider } from "./contexts/ReviewContext";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import PropertyView from "./pages/PropertyView";
import ReviewManagement from "./pages/ReviewManagement";
import "./index.css";

const App: React.FC = () => {
  return (
    <ReviewProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reviews" element={<ReviewManagement />} />
            <Route path="/property/:propertyId" element={<PropertyView />} />
          </Routes>
        </Layout>
      </Router>
    </ReviewProvider>
  );
};

export default App;
