// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
import MySchedule from "./pages/MySchedule";
import ForgotPassword from "./pages/ForgotPassword";
import AccessibilityWidget from "./components/AccessibilityWidget";

export default function App() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-main)",
      backgroundAttachment: "fixed"
    }}>
      <Routes>
        {/* Force "/" and invalid paths to Login if not authenticated */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Public Event Routes */}
        <Route path="/events" element={<EventPage />} />
        <Route path="/event/:id" element={<EventDetails />} />

        {/* Protected Dashboard & Profile Routes */}
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

        <Route
          path="/my-schedule"
          element={
            <PrivateRoute>
              <MySchedule />
            </PrivateRoute>
          }
        />

        {/* Event Management Routes */}
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

        {/* Catch-all: Redirect unknown routes back to Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <AccessibilityWidget />
    </div>
  );
}