/**
 * Date Utility Functions for IST (Indian Standard Time) Conversion
 * Ensures consistent timezone display across all portals
 */

/**
 * Format UTC date to IST with readable format
 * @param utcDateString - UTC date string from database
 * @returns Formatted date string in IST
 */
export const formatToIST = (utcDateString: string | Date | null | undefined): string => {
  if (!utcDateString) return "Not available";
  
  try {
    const date = new Date(utcDateString);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

/**
 * Format UTC date to short IST format (for compact displays)
 * @param utcDateString - UTC date string from database
 * @returns Short formatted date string in IST
 */
export const formatToISTShort = (utcDateString: string | Date | null | undefined): string => {
  if (!utcDateString) return "N/A";
  
  try {
    const date = new Date(utcDateString);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid";
  }
};

/**
 * Format UTC date to IST date only (no time)
 * @param utcDateString - UTC date string from database
 * @returns Date-only string in IST
 */
export const formatToISTDate = (utcDateString: string | Date | null | undefined): string => {
  if (!utcDateString) return "Not available";
  
  try {
    const date = new Date(utcDateString);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

/**
 * Format UTC date to relative time in IST context
 * @param utcDateString - UTC date string from database
 * @returns Relative time string (e.g., "2 hours ago")
 */
export const formatToRelativeTime = (utcDateString: string | Date | null | undefined): string => {
  if (!utcDateString) return "Unknown";
  
  try {
    const date = new Date(utcDateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return formatToISTShort(utcDateString);
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "Unknown";
  }
};

/**
 * Get time remaining until a deadline (in IST context)
 * @param deadlineUTC - Deadline date in UTC
 * @returns Time remaining string
 */
export const getTimeRemaining = (deadlineUTC: string | Date | null | undefined): string => {
  if (!deadlineUTC) return "No deadline";
  
  try {
    const deadline = new Date(deadlineUTC);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    
    if (diffMs < 0) return "Expired";
    
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays > 0) return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
    if (diffHours > 0) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} left`;
    
    const diffMins = Math.floor(diffMs / 60000);
    return `${diffMins} min${diffMins !== 1 ? 's' : ''} left`;
  } catch (error) {
    console.error("Error calculating time remaining:", error);
    return "Unknown";
  }
};

/**
 * Check if a date is within the last 24 hours
 * @param dateString - Date string to check
 * @returns Boolean indicating if within 24 hours
 */
export const isWithin24Hours = (dateString: string | Date | null | undefined): boolean => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / 3600000;
    
    return diffHours <= 24 && diffHours >= 0;
  } catch (error) {
    console.error("Error checking 24 hour window:", error);
    return false;
  }
};
