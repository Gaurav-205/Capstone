/**
 * Utility functions for handling avatar URLs
 */

// Cache for avatar URLs to avoid unnecessary processing
const avatarCache = new Map<string, string>();

/**
 * Gets the proper URL for an avatar from various possible formats
 * @param avatarPath The path or URL to the avatar
 * @returns A properly formatted URL to display the avatar
 */
export const getAvatarUrl = (avatarPath: string): string => {
  // Return empty string for undefined/null/empty paths
  if (!avatarPath) {
    console.log('Avatar path is empty or undefined');
    return '';
  }
  
  // Check cache first
  if (avatarCache.has(avatarPath)) {
    return avatarCache.get(avatarPath) || '';
  }
  
  let result = '';
  
  // If it's already a full URL (starts with http/https), return as is
  if (avatarPath.startsWith('http')) {
    result = avatarPath;
    console.log('Avatar is already a full URL:', result);
  }
  // If it's an upload path that starts with /uploads, prefix with API URL
  else if (avatarPath.startsWith('/uploads')) {
    result = `${process.env.REACT_APP_API_URL?.replace('/api', '')}${avatarPath}`;
    console.log('Avatar is a server path with /uploads:', result);
  }
  // If it's a relative path without leading slash, add it
  else if (!avatarPath.startsWith('/') && !avatarPath.includes('://')) {
    result = `${process.env.REACT_APP_API_URL?.replace('/api', '')}/uploads/avatar/${avatarPath}`;
    console.log('Avatar is a relative path:', result);
  }
  // Fallback
  else {
    result = avatarPath;
    console.log('Avatar used fallback handling:', result);
  }
  
  // Cache the result
  avatarCache.set(avatarPath, result);
  
  // Add timestamp to prevent caching if needed
  if (result && !result.includes('?') && !result.includes('://')) {
    result = `${result}?t=${Date.now()}`;
  }
  
  return result;
}; 