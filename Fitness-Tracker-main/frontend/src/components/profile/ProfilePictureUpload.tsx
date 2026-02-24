// src/components/profile/ProfilePictureUpload.tsx
// FIXED VERSION - No 'age' reference
import { Camera, User } from "lucide-react";

interface ProfilePictureUploadProps {
    currentImage?: string;
    onImageChange: (imageDataUrl: string) => void;
}

export const ProfilePictureUpload = ({
                                         currentImage,
                                         onImageChange,
                                     }: ProfilePictureUploadProps) => {
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file");
            return;
        }

        // Validate file size (max 2MB for localStorage)
        if (file.size > 2 * 1024 * 1024) {
            alert("Image must be less than 2MB");
            return;
        }

        // Read and convert to base64
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            onImageChange(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex justify-center">
            <div className="relative group">
                {/* Avatar Circle */}
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center transition-transform group-hover:scale-105">
                    {currentImage ? (
                        <img
                            src={currentImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User className="w-14 h-14 text-primary-foreground" />
                    )}
                </div>

                {/* Overlay on hover */}
                <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Camera className="w-8 h-8 text-white" />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </label>

                {/* Change Button */}
                <label className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 text-xs bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                    Change
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </label>
            </div>
        </div>
    );
};