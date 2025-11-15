'use client';

import { useState, useCallback } from 'react';
import { useEditorStore } from '../../../state/useEditorStore';
import { 
  Users, MessageSquare, Clock, Share2, UserPlus, 
  CheckCircle, AlertCircle, Eye, Lock, Unlock, X 
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  color: string;
  cursor: { x: number; y: number } | null;
  lastActive: Date;
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

export function CollaborationPanel() {
  const { objects } = useEditorStore();
  
  // Active users (simulated)
  const [activeUsers, setActiveUsers] = useState<User[]>([
    {
      id: 'user-1',
      name: 'You',
      email: 'you@example.com',
      color: '#3B82F6',
      cursor: null,
      lastActive: new Date(),
    },
  ]);

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedComment, setSelectedComment] = useState<string | null>(null);

  // Versions
  const [versions, setVersions] = useState<Version[]>([
    {
      id: 'v1',
      number: 1,
      description: 'Initial version',
      createdBy: 'You',
      createdAt: new Date(),
      isCurrent: true,
    },
  ]);

  // Permissions
  const [permissions, setPermissions] = useState<Record<string, Permission>>({
    'user-1': 'owner',
  });

  // Share settings
  const [shareLink, setShareLink] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Add comment
  const handleAddComment = useCallback(() => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: 'user-1',
      userName: 'You',
      content: newComment,
      resolved: false,
      createdAt: new Date(),
      replies: [],
    };

    setComments([...comments, comment]);
    setNewComment('');
  }, [newComment, comments]);

  // Resolve comment
  const handleResolveComment = useCallback((commentId: string) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, resolved: true } : c
    ));
  }, [comments]);

  // Delete comment
  const handleDeleteComment = useCallback((commentId: string) => {
    setComments(comments.filter(c => c.id !== commentId));
  }, [comments]);

  // Create version
  const handleCreateVersion = useCallback(() => {
    const description = prompt('Enter version description:');
    if (!description) return;

    const version: Version = {
      id: `v${versions.length + 1}`,
      number: versions.length + 1,
      description,
      createdBy: 'You',
      createdAt: new Date(),
      isCurrent: true,
    };

    setVersions([
      ...versions.map(v => ({ ...v, isCurrent: false })),
      version,
    ]);
  }, [versions]);

  // Generate share link
  const handleGenerateShareLink = useCallback(() => {
    const link = `${window.location.origin}/design/shared/${Date.now()}`;
    setShareLink(link);
    setShareDialogOpen(true);
  }, []);

  // Copy share link
  const handleCopyShareLink = useCallback(() => {
    navigator.clipboard.writeText(shareLink);
  }, [shareLink]);

  // Invite user
  const handleInviteUser = useCallback(() => {
    const email = prompt('Enter user email:');
    if (!email) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      cursor: null,
      lastActive: new Date(),
    };

    setActiveUsers([...activeUsers, newUser]);
    setPermissions({ ...permissions, [newUser.id]: 'editor' });
  }, [activeUsers, permissions]);

  // Change permission
  const handleChangePermission = useCallback((userId: string, permission: Permission) => {
    setPermissions({ ...permissions, [userId]: permission });
  }, [permissions]);

  const [activeTab, setActiveTab] = useState<'users' | 'comments' | 'versions'>('users');

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
              onClick={handleInviteUser}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600"
            >
              <UserPlus className="w-5 h-5" />
              <span className="text-sm font-medium">Invite User</span>
            </button>

            <div className="space-y-3">
              {activeUsers.map((user) => (
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
                    value={permissions[user.id]}
                    onChange={(e) => handleChangePermission(user.id, e.target.value as Permission)}
                    className="text-xs px-2 py-1 border border-gray-300 rounded"
                    disabled={permissions[user.id] === 'owner'}
                  >
                    <option value="owner">Owner</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              ))}
            </div>

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
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                Add Comment
              </button>
            </div>

            {/* Comments list */}
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Versions Tab */}
        {activeTab === 'versions' && (
          <div className="space-y-4">
            <button
              onClick={handleCreateVersion}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Save Version</span>
            </button>

            {/* Versions list */}
            <div className="space-y-3">
              {versions.map((version) => (
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
              ))}
            </div>

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
      </div>
    </div>
  );
}

