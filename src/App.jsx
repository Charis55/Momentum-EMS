// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreateEvent from "./pages/CreateEvent";
import EventPage from "./pages/EventPage"; 
import EventDetails from "./pages/EventDetails"; // ✅ IMPORTED THIS
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import PrivateRoute from "./components/PrivateRoute";

// ✅ ADDED THIS IMPORT to fix the SyntaxError
import OrganizerDashboard from "./pages/OrganizerDashboard"; 

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ✅ Leads to the LIST of all events */}
        <Route path="/events" element={<EventPage />} />

        {/* ✅ Leads to the SINGLE event detail view */}
        <Route path="/event/:id" element={<EventDetails />} />

        <Route
          path="/create"
          element={
            <PrivateRoute>
              <CreateEvent />
            </PrivateRoute>
          }
        />

        {/* ✅ ADDED THIS ROUTE to fix "No routes matched location /organizer-dashboard" */}
        <Route
          path="/organizer-dashboard"
          element={
            <PrivateRoute>
              <OrganizerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}