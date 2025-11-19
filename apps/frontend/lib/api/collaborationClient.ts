/**
 * Collaboration API Client
 * Handles all API calls for collaboration features (comments, collaborators, versions)
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// Backend types matching Django serializers
export interface BackendCollaborator {
  id: string;
  design_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  invited_by: string;
  invited_at: string;
}

export interface BackendComment {
  id: string;
  design_id: string;
  user_id: string;
  object_id: string | null;
  x: number | null;
  y: number | null;
  parent_id: string | null;
  content: string;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendVersion {
  id: string;
  design_id: string;
  version_number: number;
  created_by: string;
  snapshot: any;
  description: string;
  created_at: string;
}

// Custom error class for collaboration API errors
export class CollaborationAPIError extends Error {
  isNotFound: boolean;
  isNetworkError: boolean;
  statusCode?: number;

  constructor(message: string, isNotFound = false, isNetworkError = false, statusCode?: number) {
    super(message);
    this.name = 'CollaborationAPIError';
    this.isNotFound = isNotFound;
    this.isNetworkError = isNetworkError;
    this.statusCode = statusCode;
  }
}

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new CollaborationAPIError('Not found', true, false, 404);
      }
      
      let errorMessage = `API error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new CollaborationAPIError(errorMessage, false, false, response.status);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof CollaborationAPIError) {
      throw error;
    }
    
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new CollaborationAPIError(
        'Network error: Unable to connect to server',
        false,
        true
      );
    }
    
    throw new CollaborationAPIError(
      error instanceof Error ? error.message : 'Unknown error',
      false,
      true
    );
  }
}

// Collaborators API
export async function getCollaborators(designId: string): Promise<BackendCollaborator[]> {
  try {
    const response = await apiRequest<{ success: boolean; collaborators: BackendCollaborator[] }>(
      `/api/designs/${encodeURIComponent(designId)}/collaborators/`
    );
    return response.collaborators || [];
  } catch (error) {
    if (error instanceof CollaborationAPIError && error.isNotFound) {
      return []; // Return empty array for 404
    }
    throw error;
  }
}

export async function addCollaborator(
  designId: string,
  data: {
    user_id: string;
    role: 'owner' | 'editor' | 'viewer';
    invited_by: string;
  }
): Promise<BackendCollaborator> {
  const response = await apiRequest<{ success: boolean; collaborator: BackendCollaborator }>(
    `/api/designs/${encodeURIComponent(designId)}/collaborators/`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  return response.collaborator;
}

export async function removeCollaborator(designId: string, userId: string): Promise<void> {
  await apiRequest<{ success: boolean }>(
    `/api/designs/${encodeURIComponent(designId)}/collaborators/${encodeURIComponent(userId)}/`,
    {
      method: 'DELETE',
    }
  );
}

// Comments API
export async function getComments(designId: string): Promise<BackendComment[]> {
  try {
    const response = await apiRequest<{ success: boolean; comments: BackendComment[] }>(
      `/api/designs/${encodeURIComponent(designId)}/comments/`
    );
    return response.comments || [];
  } catch (error) {
    if (error instanceof CollaborationAPIError && error.isNotFound) {
      return []; // Return empty array for 404
    }
    throw error;
  }
}

export async function createComment(
  designId: string,
  data: {
    user_id: string;
    content: string;
    object_id?: string;
    x?: number;
    y?: number;
    parent_id?: string;
  }
): Promise<BackendComment> {
  const response = await apiRequest<{ success: boolean; comment: BackendComment }>(
    `/api/designs/${encodeURIComponent(designId)}/comments/`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  return response.comment;
}

export async function resolveComment(commentId: string): Promise<BackendComment> {
  const response = await apiRequest<{ success: boolean; comment: BackendComment }>(
    `/api/comments/${commentId}/resolve/`,
    {
      method: 'POST',
    }
  );
  return response.comment;
}

export async function deleteComment(commentId: string): Promise<void> {
  await apiRequest<{ success: boolean }>(
    `/api/comments/${commentId}/`,
    {
      method: 'DELETE',
    }
  );
}

// Versions API
export async function getVersions(designId: string): Promise<BackendVersion[]> {
  try {
    const response = await apiRequest<{ success: boolean; versions: BackendVersion[] }>(
      `/api/designs/${encodeURIComponent(designId)}/versions/`
    );
    return response.versions || [];
  } catch (error) {
    if (error instanceof CollaborationAPIError && error.isNotFound) {
      return []; // Return empty array for 404
    }
    throw error;
  }
}

export async function createVersion(
  designId: string,
  data: {
    user_id: string;
    snapshot: any;
    description: string;
  }
): Promise<BackendVersion> {
  const response = await apiRequest<{ success: boolean; version: BackendVersion }>(
    `/api/designs/${encodeURIComponent(designId)}/versions/`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  return response.version;
}

export async function restoreVersion(versionId: string): Promise<any> {
  const response = await apiRequest<{ success: boolean; snapshot: any }>(
    `/api/versions/${versionId}/restore/`,
    {
      method: 'POST',
    }
  );
  return response.snapshot;
}
