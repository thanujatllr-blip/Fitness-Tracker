// src/pages/Profile.tsx - UPDATED with proper layout and buttons
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
//import { User, Mail, Target, Scale, Activity, Dumbbell, Edit } from "lucide-react";
import { Mail, Target, Scale, Activity, Dumbbell, Edit } from "lucide-react";
import profileService, {
    type UserProfile,
    type Biometrics,
    type Goals,
    type ProfileStats,
} from "../services/profile.service";
import { EditGoalsModal } from "../components/profile/EditGoalsModal";
import { EditBiometricsModal } from "../components/profile/EditBiometricsModal";

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [biometrics, setBiometrics] = useState<Biometrics | null>(null);
    const [goals, setGoals] = useState<Goals | null>(null);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
    const [isBiometricsModalOpen, setIsBiometricsModalOpen] = useState(false);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setIsLoading(true);

            const [userData, biometricsData, goalsData, statsData] = await Promise.all([
                profileService.getCurrentUser(),
                profileService.getLatestBiometrics(),
                profileService.getGoals(),
                profileService.getProfileStats(),
            ]);

            setUser(userData);
            setBiometrics(biometricsData);
            setGoals(goalsData);
            setStats(statsData);
        } catch (error) {
            console.error("Failed to load profile data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoalsUpdated = () => {
        loadProfileData(); // Refresh all data
    };

    const handleBiometricsUpdated = () => {
        loadProfileData(); // Refresh all data
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container px-4 md:px-8 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </main>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container px-4 md:px-8 py-8">
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Failed to load profile</p>
                    </div>
                </main>
            </div>
        );
    }

    const userInitials = profileService.getUserInitials(user);
    const fullName = profileService.getFullName(user);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container px-4 md:px-8 py-8 pb-24 md:pb-8">
                <div className="max-w-4xl mx-auto">
                    {/* Profile Header */}
                    <div className="bg-card rounded-2xl p-8 shadow-sm border border-border/50 mb-6 animate-fade-in">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            {/* Avatar */}
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                                <span className="text-3xl font-bold text-primary-foreground">
                                    {userInitials}
                                </span>
                            </div>

                            {/* User Info */}
                            <div className="text-center md:text-left flex-1">
                                <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
                                <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 mt-2">
                                    <Mail className="w-4 h-4" />
                                    {user.email}
                                </p>
                                {biometrics && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Last updated: {new Date(biometrics.lastUpdated).toLocaleDateString()}
                                    </p>
                                )}
                            </div>

                            {/* Edit Profile Button (for user account data) */}
                            <button
                                onClick={() => navigate("/profile/edit")}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {/* Current Weight */}
                        <div
                            className="bg-card rounded-xl p-5 shadow-sm border border-border/50 animate-fade-in"
                            style={{ animationDelay: "150ms" }}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Scale className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-foreground">
                                {stats?.currentWeight ? `${stats.currentWeight} kg` : "Not set"}
                            </p>
                            <p className="text-sm text-muted-foreground">Current Weight</p>
                        </div>

                        {/* Calorie Goal */}
                        <div
                            className="bg-card rounded-xl p-5 shadow-sm border border-border/50 animate-fade-in"
                            style={{ animationDelay: "200ms" }}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-calorie/10 text-calorie">
                                    <Target className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-foreground">
                                {stats?.calorieGoal.toLocaleString()} kcal
                            </p>
                            <p className="text-sm text-muted-foreground">Calorie Goal</p>
                        </div>

                        {/* Exercise Goal */}
                        <div
                            className="bg-card rounded-xl p-5 shadow-sm border border-border/50 animate-fade-in"
                            style={{ animationDelay: "250ms" }}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-exercise/10 text-exercise">
                                    <Activity className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-foreground">
                                {stats?.exerciseGoalDaily} min
                            </p>
                            <p className="text-sm text-muted-foreground">Daily Exercise</p>
                        </div>

                        {/* Target Weight */}
                        <div
                            className="bg-card rounded-xl p-5 shadow-sm border border-border/50 animate-fade-in"
                            style={{ animationDelay: "300ms" }}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Dumbbell className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-foreground">
                                {stats?.targetWeight ? `${stats.targetWeight} kg` : "Not set"}
                            </p>
                            <p className="text-sm text-muted-foreground">Target Weight</p>
                        </div>
                    </div>

                    {/* Biometrics Section */}
                    <div
                        className="mb-6 bg-card rounded-2xl p-6 shadow-sm border border-border/50 animate-fade-in"
                        style={{ animationDelay: "350ms" }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-foreground">
                                Biometric Information
                            </h2>
                            <button
                                onClick={() => setIsBiometricsModalOpen(true)}
                                className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Biometrics
                            </button>
                        </div>

                        {!biometrics ? (
                            <div className="text-center py-8">
                                <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground mb-4">No biometrics set yet</p>
                                <button
                                    onClick={() => setIsBiometricsModalOpen(true)}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    Set Biometrics
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Height</p>
                                    <p className="text-lg font-semibold text-foreground">
                                        {biometrics.heightCm} cm
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Weight</p>
                                    <p className="text-lg font-semibold text-foreground">
                                        {biometrics.weightKg} kg
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">BMI</p>
                                    <p className="text-lg font-semibold text-foreground">
                                        {biometrics.bmi}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Age</p>
                                    <p className="text-lg font-semibold text-foreground">
                                        {biometrics.age} years
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Goals Section */}
                    <div
                        className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 animate-fade-in"
                        style={{ animationDelay: "400ms" }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-foreground">Your Goals</h2>
                            <button
                                onClick={() => setIsGoalsModalOpen(true)}
                                className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium"
                            >
                                Edit All
                            </button>
                        </div>

                        {!goals ? (
                            <div className="text-center py-8">
                                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground mb-4">No goals set yet</p>
                                <button
                                    onClick={() => setIsGoalsModalOpen(true)}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    Set Your Goals
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Daily Calorie Goal */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                                    <div>
                                        <p className="font-medium text-foreground">Daily Calorie Intake</p>
                                        <p className="text-sm text-muted-foreground">
                                            Target: {Math.round(goals.dailyCalorieGoal).toLocaleString()} kcal
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsGoalsModalOpen(true)}
                                        className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-secondary transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>

                                {/* Weekly Exercise Goal */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                                    <div>
                                        <p className="font-medium text-foreground">Weekly Exercise</p>
                                        <p className="text-sm text-muted-foreground">
                                            Target: {goals.weeklyExerciseGoalMinutes} minutes (
                                            {Math.round(goals.weeklyExerciseGoalMinutes / 7)} min/day)
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsGoalsModalOpen(true)}
                                        className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-secondary transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>

                                {/* Target Weight */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                                    <div>
                                        <p className="font-medium text-foreground">Target Weight</p>
                                        <p className="text-sm text-muted-foreground">
                                            Goal: {goals.targetWeightKg} kg
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsGoalsModalOpen(true)}
                                        className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-secondary transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modals */}
            <EditGoalsModal
                isOpen={isGoalsModalOpen}
                onClose={() => setIsGoalsModalOpen(false)}
                onSuccess={handleGoalsUpdated}
                currentGoals={goals}
            />

            <EditBiometricsModal
                isOpen={isBiometricsModalOpen}
                onClose={() => setIsBiometricsModalOpen(false)}
                onSuccess={handleBiometricsUpdated}
                currentBiometrics={biometrics}
            />
        </div>
    );
};

export default Profile;