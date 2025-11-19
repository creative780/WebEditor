/**
 * Current User Hook
 * Manages current user ID with localStorage persistence
 * For MVP: uses localStorage, can be extended with proper auth later
 */

import { useState, useEffect, useCallback } from 'react';

const USER_ID_KEY = 'collab_current_user_id';
const USER_NAME_KEY = 'collab_current_user_name';
const USER_EMAIL_KEY = 'collab_current_user_email';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Generate a unique user ID if one doesn't exist
 */
function generateUserId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create current user from localStorage
 */
function getCurrentUser(): CurrentUser {
  if (typeof window === 'undefined') {
    return {
      id: 'default-user',
      name: 'Guest User',
      email: 'guest@example.com',
    };
  }

  let userId = localStorage.getItem(USER_ID_KEY);
  let userName = localStorage.getItem(USER_NAME_KEY);
  let userEmail = localStorage.getItem(USER_EMAIL_KEY);

  // Generate new user if doesn't exist
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
  }

  // Set defaults if name/email don't exist
  if (!userName) {
    userName = 'You';
    localStorage.setItem(USER_NAME_KEY, userName);
  }

  if (!userEmail) {
    userEmail = 'user@example.com';
    localStorage.setItem(USER_EMAIL_KEY, userEmail);
  }

  return {
    id: userId,
    name: userName,
    email: userEmail,
  };
}

/**
 * Hook to access and manage current user
 */
export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser>(() => getCurrentUser());

  // Load user on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  /**
   * Update user info
   */
  const updateUser = useCallback((updates: Partial<CurrentUser>) => {
    if (typeof window === 'undefined') return;

    const updatedUser = { ...user, ...updates };
    
    if (updates.id) {
      localStorage.setItem(USER_ID_KEY, updates.id);
    }
    if (updates.name) {
      localStorage.setItem(USER_NAME_KEY, updates.name);
    }
    if (updates.email) {
      localStorage.setItem(USER_EMAIL_KEY, updates.email);
    }

    setUser(updatedUser);
  }, [user]);

  /**
   * Get current user ID (for API calls)
   */
  const getUserId = useCallback((): string => {
    return user.id;
  }, [user]);

  return {
    user,
    updateUser,
    getUserId,
  };
}


