'use client';

import { useState, useCallback, useEffect } from 'react';
import { useEditorStore } from '../../../state/useEditorStore';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { 
  Users, MessageSquare, Clock, Share2, UserPlus, 
  CheckCircle, AlertCircle, Eye, Lock, Unlock, X, Loader2, RefreshCw
} from 'lucide-react';
import {
  getCollaborators,
  addCollaborator,
  removeCollaborator,
  getComments,
  createComment,
  resolveComment,
  deleteComment,
  getVersions,
  createVersion,
  CollaborationAPIError,
  type BackendCollaborator,
  type BackendComment,
  type BackendVersion,
} from '../../../lib/api/collaborationClient';
import { InviteUserDialog, type UserRole } from './InviteUserDialog';

interface CollaborationPanelProps {
  designId: string;
}

// Frontend interfaces
interface User {
  id: string;
  name: string;
  email: string;
  color: string;
  cursor: { x: number; y: number } | null;
  lastActive: Date;
  role: 'owner' | 'editor' | 'viewer';
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  x?: number;
  y?: number;
  objectId?: string;
  resolved: boolean;
  createdAt: Date;
  replies: Comment[];
}

interface Version {
  id: string;
  number: number;
  description: string;
  createdBy: string;
  createdAt: Date;
  isCurrent: boolean;
}

type Permission = 'owner' | 'editor' | 'viewer';

// Helper to generate user color from ID
function getUserColor(userId: string): string {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Convert backend comment to frontend comment with threading
function buildCommentTree(backendComments: BackendComment[], currentUserId: string, currentUserName: string): Comment[] {
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  // First pass: create all comments
  backendComments.forEach(backendComment => {
    const comment: Comment = {
      id: backendComment.id,
      userId: backendComment.user_id,
      userName: backendComment.user_id === currentUserId ? currentUserName : `User ${backendComment.user_id.slice(-4)}`,
      content: backendComment.content,
      x: backendComment.x || undefined,
      y: backendComment.y || undefined,
      objectId: backendComment.object_id || undefined,
      resolved: backendComment.resolved,
      createdAt: new Date(backendComment.created_at),
      replies: [],
    };
    commentMap.set(comment.id, comment);
  });

  // Second pass: build tree structure
  backendComments.forEach(backendComment => {
    const comment = commentMap.get(backendComment.id)!;
    if (backendComment.parent_id) {
      const parent = commentMap.get(backendComment.parent_id);
      if (parent) {
        parent.replies.push(comment);
      } else {
        // Parent not found, treat as root
        rootComments.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  return rootComments;
}

export function CollaborationPanel({ designId }: CollaborationPanelProps) {
  const { objects } = useEditorStore();
  const { user: currentUser, getUserId } = useCurrentUser();
  
  // Loading states
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active users (collaborators)
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Record<string, Permission>>({});

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Versions
  const [versions, setVersions] = useState<Version[]>([]);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);

  // Invite dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Share settings
  const [shareLink, setShareLink] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'users' | 'comments' | 'versions'>('users');

  // Load collaborators
  const loadCollaborators = useCallback(async () => {
    if (!designId) return;
    
    setLoadingCollaborators(true);
    setError(null);
    try {
      const backendCollaborators = await getCollaborators(designId);
      
      // Convert to frontend format
      const users: User[] = backendCollaborators.map(collab => ({
        id: collab.user_id,
        name: collab.user_id === currentUser.id ? currentUser.name : `User ${collab.user_id.slice(-4)}`,
        email: collab.user_id === currentUser.id ? currentUser.email : `${collab.user_id}@example.com`,
        color: getUserColor(collab.user_id),
        cursor: null,
        lastActive: new Date(collab.invited_at),
        role: collab.role,
      }));

      // Build permissions map
      const perms: Record<string, Permission> = {};
      backendCollaborators.forEach(collab => {
        perms[collab.user_id] = collab.role;
      });

      setActiveUsers(users);
      setPermissions(perms);
    } catch (err) {
      // Only show error for non-404 errors (404 means design doesn't exist yet)
      if (err instanceof CollaborationAPIError && !err.isNotFound && !err.isNetworkError) {
        console.error('Failed to load collaborators:', err);
        setError(err.message);
      } else if (err instanceof CollaborationAPIError && err.isNetworkError) {
        setError('Unable to connect to server. Please check your connection.');
      } else if (!(err instanceof CollaborationAPIError && err.isNotFound)) {
        console.error('Failed to load collaborators:', err);
        setError(err instanceof Error ? err.message : 'Failed to load collaborators');
      }
      // For 404, just set empty state (already handled by returning empty array)
    } finally {
      setLoadingCollaborators(false);
    }
  }, [designId, currentUser]);

  // Load comments
  const loadComments = useCallback(async () => {
    if (!designId) return;
    
    setLoadingComments(true);
    setError(null);
    try {
      const backendComments = await getComments(designId);
      const commentTree = buildCommentTree(backendComments, currentUser.id, currentUser.name);
      setComments(commentTree);
    } catch (err) {
      // Only show error for non-404 errors (404 means design doesn't exist yet)
      if (err instanceof CollaborationAPIError && !err.isNotFound && !err.isNetworkError) {
        console.error('Failed to load comments:', err);
        setError(err.message);
      } else if (err instanceof CollaborationAPIError && err.isNetworkError) {
        setError('Unable to connect to server. Please check your connection.');
      } else if (!(err instanceof CollaborationAPIError && err.isNotFound)) {
        console.error('Failed to load comments:', err);
        setError(err instanceof Error ? err.message : 'Failed to load comments');
      }
      // For 404, just set empty state (already handled by returning empty array)
    } finally {
      setLoadingComments(false);
    }
  }, [designId, currentUser]);

  // Load versions
  const loadVersions = useCallback(async () => {
    if (!designId) return;
    
    setLoadingVersions(true);
    setError(null);
    try {
      const backendVersions = await getVersions(designId);
      
      // Convert to frontend format
      const frontendVersions: Version[] = backendVersions.map((version, index) => ({
        id: version.id,
        number: version.version_number,
        description: version.description || 'No description',
        createdBy: version.created_by === currentUser.id ? currentUser.name : `User ${version.created_by.slice(-4)}`,
        createdAt: new Date(version.created_at),
        isCurrent: index === 0, // Most recent is current
      }));

      setVersions(frontendVersions);
    } catch (err) {
      // Only show error for non-404 errors (404 means design doesn't exist yet)
      if (err instanceof CollaborationAPIError && !err.isNotFound && !err.isNetworkError) {
        console.error('Failed to load versions:', err);
        setError(err.message);
      } else if (err instanceof CollaborationAPIError && err.isNetworkError) {
        setError('Unable to connect to server. Please check your connection.');
      } else if (!(err instanceof CollaborationAPIError && err.isNotFound)) {
        console.error('Failed to load versions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load versions');
      }
      // For 404, just set empty state (already handled by returning empty array)
    } finally {
      setLoadingVersions(false);
    }
  }, [designId, currentUser]);

  // Load all data on mount and when designId changes
  useEffect(() => {
    if (!designId) return;
    
    loadCollaborators();
    loadComments();
    loadVersions();
  }, [designId, loadCollaborators, loadComments, loadVersions]);

  // Add comment
  const handleAddComment = useCallback(async () => {
    if (!newComment.trim() || !designId) return;

    setIsSubmittingComment(true);
    setError(null);
    try {
      await createComment(designId, {
        user_id: getUserId(),
        content: newComment.trim(),
      });
      setNewComment('');
      // Reload comments
      await loadComments();
    } catch (err) {
      console.error('Failed to create comment:', err);
      if (err instanceof CollaborationAPIError) {
        if (err.isNotFound) {
          setError('Design not found. Please save your design first.');
        } else if (err.isNetworkError) {
          setError('Unable to connect to server. Please check your connection.');
        } else {
          setError(err.message);
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create comment');
      }
    } finally {
      setIsSubmittingComment(false);
    }
  }, [newComment, designId, getUserId, loadComments]);

  // Resolve comment
  const handleResolveComment = useCallback(async (commentId: string) => {
    setError(null);
    try {
      await resolveComment(commentId);
      await loadComments();
    } catch (err) {
      console.error('Failed to resolve comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to resolve comment');
    }
  }, [loadComments]);

  // Delete comment
  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    setError(null);
    try {
      await deleteComment(commentId);
      await loadComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
    }
  }, [loadComments]);

  // Create version
  const handleCreateVersion = useCallback(async () => {
    const description = prompt('Enter version description:');
    if (!description || !designId) return;

    setIsCreatingVersion(true);
    setError(null);
    try {
      // Get current design state from store
      const currentState = {
        objects: objects,
        // Add other design state as needed
      };

      await createVersion(designId, {
        user_id: getUserId(),
        snapshot: currentState,
        description: description.trim(),
      });
      await loadVersions();
    } catch (err) {
      console.error('Failed to create version:', err);
      setError(err instanceof Error ? err.message : 'Failed to create version');
    } finally {
      setIsCreatingVersion(false);
    }
  }, [designId, objects, getUserId, loadVersions]);

  // Generate share link
  const handleGenerateShareLink = useCallback(() => {
    const link = `${window.location.origin}/design/shared/${designId}`;
    setShareLink(link);
    setShareDialogOpen(true);
  }, [designId]);

  // Copy share link
  const handleCopyShareLink = useCallback(() => {
    navigator.clipboard.writeText(shareLink);
  }, [shareLink]);

  // Invite user
  const handleInviteUser = useCallback(async (email: string, role: UserRole) => {
    if (!designId) return;

    setIsInviting(true);
    setError(null);
    try {
      // For MVP, we'll use email as user_id (backend will handle user lookup in production)
      // In production, this would trigger an email invitation
      await addCollaborator(designId, {
        user_id: email, // Temporary: use email as user_id
        role: role,
        invited_by: getUserId(),
      });
      
      // Reload collaborators
      await loadCollaborators();
    } catch (err) {
      console.error('Failed to invite user:', err);
      // Transform error for InviteUserDialog
      if (err instanceof CollaborationAPIError) {
        if (err.isNotFound) {
          throw new Error('Design not found. Please save your design first.');
        } else if (err.isNetworkError) {
          throw new Error('Unable to connect to server. Please check your connection.');
        } else {
          throw new Error(err.message || 'Failed to invite user');
        }
      }
      throw err; // Let InviteUserDialog handle the error
    } finally {
      setIsInviting(false);
    }
  }, [designId, getUserId, loadCollaborators]);

  // Change permission (update collaborator role)
  const handleChangePermission = useCallback(async (userId: string, permission: Permission) => {
    if (!designId) return;
    
    setError(null);
    try {
      // Remove and re-add with new role (backend doesn't have update endpoint)
      await removeCollaborator(designId, userId);
      await addCollaborator(designId, {
        user_id: userId,
        role: permission,
        invited_by: getUserId(),
      });
      await loadCollaborators();
    } catch (err) {
      console.error('Failed to update permission:', err);
      setError(err instanceof Error ? err.message : 'Failed to update permission');
      // Reload to get correct state
      await loadCollaborators();
    }
  }, [designId, getUserId, loadCollaborators]);

  return (
    <div className="h-full bg-white overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Collaboration</h2>
          <button
            onClick={handleGenerateShareLink}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users ({activeUsers.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'comments'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments ({comments.filter(c => !c.resolved).length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'versions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Versions ({versions.length})
            </div>
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <button
              onClick={() => setInviteDialogOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600"
            >
              <UserPlus className="w-5 h-5" />
              <span className="text-sm font-medium">Invite User</span>
            </button>

            {loadingCollaborators ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-3">
                {activeUsers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No collaborators yet. Invite someone to get started!
                  </p>
                ) : (
                  activeUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <select
                        value={permissions[user.id] || 'viewer'}
                        onChange={(e) => handleChangePermission(user.id, e.target.value as Permission)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded"
                        disabled={permissions[user.id] === 'owner'}
                      >
                        <option value="owner">Owner</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Live cursors info */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Real-Time Features</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• See other users' cursors in real-time</li>
                <li>• Live editing updates instantly</li>
                <li>• Automatic conflict resolution</li>
                <li>• Presence indicators</li>
              </ul>
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            {/* New comment */}
            <div className="space-y-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={isSubmittingComment}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSubmittingComment}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
              >
                {isSubmittingComment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Comment'
                )}
              </button>
            </div>

            {/* Comments list */}
            {loadingComments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-3">
                {comments.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No comments yet. Be the first to comment!
                  </p>
                )}
                
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-lg border ${
                      comment.resolved
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{comment.userName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!comment.resolved && (
                          <button
                            onClick={() => handleResolveComment(comment.id)}
                            className="text-green-600 hover:text-green-700"
                            title="Resolve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm ${comment.resolved ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                      {comment.content}
                    </p>
                    {comment.resolved && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span>Resolved</span>
                      </div>
                    )}
                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="p-2 bg-gray-50 rounded">
                            <div className="flex items-start justify-between mb-1">
                              <div>
                                <p className="text-xs font-medium text-gray-900">{reply.userName}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(reply.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeleteComment(reply.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Delete"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-700">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Versions Tab */}
        {activeTab === 'versions' && (
          <div className="space-y-4">
            <button
              onClick={handleCreateVersion}
              disabled={isCreatingVersion}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isCreatingVersion ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Creating...</span>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">Save Version</span>
                </>
              )}
            </button>

            {loadingVersions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-3">
                {versions.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No versions yet. Create your first version!
                  </p>
                ) : (
                  versions.map((version) => (
                    <div
                      key={version.id}
                      className={`p-3 rounded-lg border ${
                        version.isCurrent
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              Version {version.number}
                            </p>
                            {version.isCurrent && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {version.createdBy} • {new Date(version.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{version.description}</p>
                      {!version.isCurrent && (
                        <button className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium">
                          Restore This Version
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Version History</h3>
              <p className="text-xs text-gray-600">
                All changes are automatically tracked. Create manual versions for important milestones.
              </p>
            </div>
          </div>
        )}

        {/* Share Dialog */}
        {shareDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Share Design</h3>
                <button
                  onClick={() => setShareDialogOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Share Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                    />
                    <button
                      onClick={handleCopyShareLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    Anyone with this link can view your design. Set permissions to control who can edit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invite User Dialog */}
        <InviteUserDialog
          isOpen={inviteDialogOpen}
          onClose={() => setInviteDialogOpen(false)}
          onInvite={handleInviteUser}
        />
      </div>
    </div>
  );
}
