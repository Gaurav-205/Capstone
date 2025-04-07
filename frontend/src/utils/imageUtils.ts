import { API_URL } from '../config';

/**
 * Generates a properly formatted URL for user avatars with cache busting
 * @param avatar - The avatar filename or path
 * @param timestamp - Optional timestamp for cache busting
 * @returns Formatted avatar URL
 */
export const getAvatarUrl = (avatar: string, timestamp?: number): string => {
  // If the avatar is already a full URL, return it
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  
  // Add timestamp for cache busting if provided
  const cacheBuster = timestamp ? `?t=${timestamp}` : '';
  
  // Ensure the avatar path is properly formatted
  const avatarPath = avatar.startsWith('/') ? avatar.substring(1) : avatar;
  
  // Return the complete URL
  return `${API_URL}/uploads/avatars/${avatarPath}${cacheBuster}`;
};

/**
 * Handles image loading errors by replacing the src with a fallback
 * @param event - The error event from the image
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>): void => {
  const imgElement = event.currentTarget;
  
  // Hide the broken image
  imgElement.style.display = 'none';
  
  // Optional: You could set a fallback image here
  // imgElement.src = '/path/to/fallback/image.png';
  
  // Log the error for debugging
  console.error('Image failed to load:', imgElement.src);
};