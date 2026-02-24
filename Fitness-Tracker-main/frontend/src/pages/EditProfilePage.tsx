// src/pages/EditProfilePage.tsx - Edit user account information
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { ProfilePictureUpload } from "../components/profile/ProfilePictureUpload";
import { ArrowLeft, User, Mail, AtSign, Lock, Eye, EyeOff, Save } from "lucide-react";
//import profileService, { type UserProfile } from "../services/profile.service";
import profileService from "../services/profile.service";
import api from "@/services/api.ts";

const EditProfile = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [profileImage, setProfileImage] = useState<string | undefined>();
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        loadUserData();
        loadProfileImage();
    }, []);

    const loadUserData = async () => {
        try {
            setIsLoading(true);
            const user = await profileService.getCurrentUser();
            setFormData({
                firstname: user.firstname || "",
                lastname: user.lastname || "",
                username: user.username || "",
                email: user.email || "",
                password: "",
                confirmPassword: "",
            });
        } catch (error) {
            console.error("Failed to load user data:", error);
            setError("Failed to load profile");
        } finally {
            setIsLoading(false);
        }
    };

    const loadProfileImage = () => {
        // Load from localStorage (temporary until backend supports it)
        const saved = localStorage.getItem("profileImage");
        if (saved) {
            setProfileImage(saved);
        }
    };

    const handleImageChange = (imageDataUrl: string) => {
        setProfileImage(imageDataUrl);
        // Save to localStorage (temporary until backend supports it)
        localStorage.setItem("profileImage", imageDataUrl);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSaving(true);

        try {
            // Call the new endpoint
            await api.put('/users/me', {
                firstname: formData.firstname,
                lastname: formData.lastname,
                username: formData.username,
                email: formData.email,
            });

            alert("Profile updated successfully!");
            navigate("/profile");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
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

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container px-4 md:px-8 py-8 pb-24 md:pb-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8 animate-fade-in">
                        <button
                            onClick={() => navigate("/profile")}
                            className="p-2 hover:bg-secondary rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
                            <p className="text-muted-foreground">Update your personal information</p>
                        </div>
                    </div>

                    {/* Profile Picture Upload */}
                    <div className="mb-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
                        <ProfilePictureUpload
                            currentImage={profileImage}
                            onImageChange={handleImageChange}
                        />
                        {/*
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            Stored locally (backend storage not yet implemented)
                        </p>
                        */}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div
                            className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 space-y-5 animate-fade-in"
                            style={{ animationDelay: "150ms" }}
                        >
                            <h2 className="text-lg font-semibold text-foreground">
                                Personal Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* First Name */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="firstname"
                                        className="block text-sm font-medium text-foreground"
                                    >
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            id="firstname"
                                            name="firstname"
                                            value={formData.firstname}
                                            onChange={handleChange}
                                            placeholder="Enter first name"
                                            className="w-full pl-10 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Last Name */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="lastname"
                                        className="block text-sm font-medium text-foreground"
                                    >
                                        Last Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            id="lastname"
                                            name="lastname"
                                            value={formData.lastname}
                                            onChange={handleChange}
                                            placeholder="Enter last name"
                                            className="w-full pl-10 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Username */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-foreground"
                                >
                                    Username
                                </label>
                                <div className="relative">
                                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Enter username"
                                        className="w-full pl-10 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-foreground"
                                >
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter email"
                                        className="w-full pl-10 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div
                            className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 space-y-5 animate-fade-in"
                            style={{ animationDelay: "200ms" }}
                        >
                            <h2 className="text-lg font-semibold text-foreground">
                                Change Password
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Leave blank to keep current password
                            </p>

                            {/* New Password */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-foreground"
                                >
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter new password"
                                        className="w-full pl-10 pr-10 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-foreground"
                                >
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm new password"
                                        className="w-full pl-10 pr-10 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Backend Note */}
                        {/*

                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-sm">
                            <p className="text-yellow-700 dark:text-yellow-400 font-medium mb-1">
                                ⚠️ Backend Implementation Required
                            </p>
                            <p className="text-yellow-600 dark:text-yellow-500 text-xs">
                                Endpoint{" "}
                                <code className="bg-yellow-500/20 px-1 py-0.5 rounded">
                                    PUT /api/users/me
                                </code>{" "}
                                needs implementation for data persistence.
                            </p>
                        </div>

                        */}

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div
                            className="flex flex-col sm:flex-row gap-3 pt-2 animate-fade-in"
                            style={{ animationDelay: "250ms" }}
                        >
                            <button
                                type="button"
                                onClick={() => navigate("/profile")}
                                className="flex-1 px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};
export default EditProfile;
