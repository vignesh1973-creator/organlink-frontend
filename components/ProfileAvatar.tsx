import { User } from "lucide-react";

interface ProfileAvatarProps {
  photoBase64?: string | null;
  gender?: string;
  fullName: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const ProfileAvatar = ({
  photoBase64,
  gender,
  fullName,
  size = "md",
}: ProfileAvatarProps) => {
  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-16 h-16 text-lg",
    lg: "w-24 h-24 text-2xl",
    xl: "w-32 h-32 text-3xl",
  };

  const sizeClass = sizeClasses[size];

  // If we have Aadhaar photo, display it
  if (photoBase64) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden border-2 border-gray-200 shadow-sm`}>
        <img
          src={photoBase64}
          alt={`${fullName}'s profile`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Otherwise, show gender-based placeholder
  const getPlaceholderColor = () => {
    if (gender?.toLowerCase() === "male") {
      return "bg-blue-100 text-blue-600";
    } else if (gender?.toLowerCase() === "female") {
      return "bg-pink-100 text-pink-600";
    } else {
      return "bg-gray-100 text-gray-600";
    }
  };

  const getInitials = () => {
    const names = fullName.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={`${sizeClass} rounded-full ${getPlaceholderColor()} flex items-center justify-center font-semibold border-2 border-gray-200 shadow-sm`}
    >
      {getInitials()}
    </div>
  );
};
