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

// ✅ ADDED THIS IMPORT
import EditEvent from "./pages/EditEvent"; 

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

        <Route
          path="/organizer-dashboard"
          element={
            <PrivateRoute>
              <OrganizerDashboard />
            </PrivateRoute>
          }
        />

        {/* ✅ ADDED THIS ROUTE to fix the console error */}
        {/* This matches the nav(`/edit-event/${ev.id}`) in your Dashboard */}
        <Route
          path="/edit-event/:eventId"
          element={
            <PrivateRoute>
              <EditEvent />
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