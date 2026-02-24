// src/App.tsx - Main app component with routing

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
//import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
//import { AnimatePresence } from "framer-motion";
import { AuthProvider } from '@/hooks/useAuth';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import Exercise from '@/pages/ExercisePage';
import Food from '@/pages/FoodPage';
import Profile from '@/pages/ProfilePage';
import EditProfile from '@/pages/EditProfilePage';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AddMeal from "@/pages/AddMealPage.tsx";
import LogWorkout from "@/pages/LogWorkoutPage.tsx";
import Calendar from "@/pages/CalendarPage.tsx";


function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected routes */}
                    <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}/>
                    <Route path="/exercise" element={<ProtectedRoute><Exercise /></ProtectedRoute>}/>
                    <Route path="/exercise/log" element={<ProtectedRoute><LogWorkout /></ProtectedRoute>}/>
                    <Route path="/food" element={<ProtectedRoute><Food /></ProtectedRoute>} />
                    <Route path="/food/add" element={<ProtectedRoute><AddMeal /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                    <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />

                    {/* redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;