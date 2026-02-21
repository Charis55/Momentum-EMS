// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreateEvent from "./pages/CreateEvent";
import EventPage from "./pages/EventPage"; 
import EventDetails from "./pages/EventDetails"; 
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import PrivateRoute from "./components/PrivateRoute";
import OrganizerDashboard from "./pages/OrganizerDashboard"; 
import EditEvent from "./pages/EditEvent"; 

// ✅ IMPORT YOUR SCHEDULE COMPONENT
// Create this file if you haven't already
import MySchedule from "./pages/MySchedule"; 

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ✅ Public Event Routes */}
        <Route path="/events" element={<EventPage />} />
        <Route path="/event/:id" element={<EventDetails />} />

        {/* ✅ Protected Dashboard & Profile Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/organizer-dashboard"
          element={
            <PrivateRoute>
              <OrganizerDashboard />
            </PrivateRoute>
          }
        />

        {/* ✅ FIX: ADDED MY-SCHEDULE ROUTE */}
        <Route
          path="/my-schedule"
          element={
            <PrivateRoute>
              <MySchedule />
            </PrivateRoute>
          }
        />

        {/* ✅ Event Management Routes */}
        <Route
          path="/create"
          element={
            <PrivateRoute>
              <CreateEvent />
            </PrivateRoute>
          }
        />

        <Route
          path="/edit-event/:eventId"
          element={
            <PrivateRoute>
              <EditEvent />
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