/**
 * Collaboration Service - Real-time collaboration features
 * Handles multi-user editing, presence, comments, and permissions
 */

import { Pool } from 'pg';
import pool from '../../config/database';
import { Server as SocketServer } from 'socket.io';

export interface Collaborator {
  id: string;
  design_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  invited_by: string;
  invited_at: Date;
}

export interface Comment {
  id: string;
  design_id: string;
  user_id: string;
  object_id: string | null;
  content: string;
  x: number | null;
  y: number | null;
  parent_id: string | null;
  resolved: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DesignVersion {
  id: string;
  design_id: string;
  version_number: number;
  created_by: string;
  snapshot: any;
  description: string;
  created_at: Date;
}

export interface UserPresence {
  user_id: string;
  design_id: string;
  cursor_x: number | null;
  cursor_y: number | null;
  last_active: Date;
  socket_id: string;
}

export class CollaborationService {
  private db: Pool;
  private io: SocketServer | null = null;
  private presenceMap: Map<string, UserPresence> = new Map();

  constructor() {
    this.db = pool;
  }

  // Initialize Socket.IO
  initializeSocket(io: SocketServer): void {
    this.io = io;
    this.setupSocketHandlers();
  }

  // Setup Socket.IO event handlers
  private setupSocketHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Join design room
      socket.on('design:join', async (data: { designId: string; userId: string }) => {
        socket.join(`design:${data.designId}`);
        
        // Add to presence
        const presence: UserPresence = {
          user_id: data.userId,
          design_id: data.designId,
          cursor_x: null,
          cursor_y: null,
          last_active: new Date(),
          socket_id: socket.id,
        };
        this.presenceMap.set(socket.id, presence);

        // Broadcast user joined
        socket.to(`design:${data.designId}`).emit('user:joined', {
          userId: data.userId,
          socketId: socket.id,
        });

        // Send current users
        const currentUsers = this.getUsersInDesign(data.designId);
        socket.emit('users:list', currentUsers);
      });

      // Cursor movement
      socket.on('cursor:move', (data: { x: number; y: number }) => {
        const presence = this.presenceMap.get(socket.id);
        if (presence) {
          presence.cursor_x = data.x;
          presence.cursor_y = data.y;
          presence.last_active = new Date();

          // Broadcast cursor position
          socket.to(`design:${presence.design_id}`).emit('cursor:update', {
            userId: presence.user_id,
            x: data.x,
            y: data.y,
          });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        const presence = this.presenceMap.get(socket.id);
        if (presence) {
          socket.to(`design:${presence.design_id}`).emit('user:left', {
            userId: presence.user_id,
          });
          this.presenceMap.delete(socket.id);
        }
      });
    });
  }

  // Get users currently in design
  private getUsersInDesign(designId: string): UserPresence[] {
    const users: UserPresence[] = [];
    this.presenceMap.forEach((presence) => {
      if (presence.design_id === designId) {
        users.push(presence);
      }
    });
    return users;
  }

  // Add collaborator
  async addCollaborator(data: {
    design_id: string;
    user_id: string;
    role: 'owner' | 'editor' | 'viewer';
    invited_by: string;
  }): Promise<Collaborator> {
    const query = `
      INSERT INTO design_collaborators (design_id, user_id, role, invited_by)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (design_id, user_id) 
      DO UPDATE SET role = EXCLUDED.role
      RETURNING *
    `;

    const values = [data.design_id, data.user_id, data.role, data.invited_by];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  // Get collaborators
  async getCollaborators(design_id: string): Promise<Collaborator[]> {
    const query = 'SELECT * FROM design_collaborators WHERE design_id = $1';
    const result = await this.db.query(query, [design_id]);
    return result.rows;
  }

  // Remove collaborator
  async removeCollaborator(design_id: string, user_id: string): Promise<boolean> {
    const query = 'DELETE FROM design_collaborators WHERE design_id = $1 AND user_id = $2';
    const result = await this.db.query(query, [design_id, user_id]);
    return result.rowCount > 0;
  }

  // Check permission
  async checkPermission(
    design_id: string,
    user_id: string,
    required_role: 'owner' | 'editor' | 'viewer'
  ): Promise<boolean> {
    const query = 'SELECT role FROM design_collaborators WHERE design_id = $1 AND user_id = $2';
    const result = await this.db.query(query, [design_id, user_id]);
    
    if (result.rows.length === 0) return false;

    const role = result.rows[0].role;
    const roleHierarchy = { owner: 3, editor: 2, viewer: 1 };
    
    return roleHierarchy[role] >= roleHierarchy[required_role];
  }

  // Create comment
  async createComment(data: {
    design_id: string;
    user_id: string;
    content: string;
    object_id?: string;
    x?: number;
    y?: number;
    parent_id?: string;
  }): Promise<Comment> {
    const query = `
      INSERT INTO design_comments (
        design_id, user_id, content, object_id, x, y, parent_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      data.design_id,
      data.user_id,
      data.content,
      data.object_id || null,
      data.x || null,
      data.y || null,
      data.parent_id || null,
    ];

    const result = await this.db.query(query, values);
    const comment = result.rows[0];

    // Broadcast comment via Socket.IO
    if (this.io) {
      this.io.to(`design:${data.design_id}`).emit('comment:created', comment);
    }

    return comment;
  }

  // Get comments
  async getComments(design_id: string): Promise<Comment[]> {
    const query = `
      SELECT * FROM design_comments 
      WHERE design_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await this.db.query(query, [design_id]);
    return result.rows;
  }

  // Resolve comment
  async resolveComment(comment_id: string): Promise<Comment | null> {
    const query = `
      UPDATE design_comments 
      SET resolved = true, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await this.db.query(query, [comment_id]);
    
    if (result.rows[0] && this.io) {
      this.io.to(`design:${result.rows[0].design_id}`).emit('comment:resolved', result.rows[0]);
    }

    return result.rows[0] || null;
  }

  // Delete comment
  async deleteComment(comment_id: string): Promise<boolean> {
    const query = 'DELETE FROM design_comments WHERE id = $1 RETURNING design_id';
    const result = await this.db.query(query, [comment_id]);
    
    if (result.rows[0] && this.io) {
      this.io.to(`design:${result.rows[0].design_id}`).emit('comment:deleted', { id: comment_id });
    }

    return result.rowCount > 0;
  }

  // Create version
  async createVersion(data: {
    design_id: string;
    created_by: string;
    snapshot: any;
    description: string;
  }): Promise<DesignVersion> {
    // Get next version number
    const versionQuery = `
      SELECT COALESCE(MAX(version_number), 0) as max_version 
      FROM design_versions 
      WHERE design_id = $1
    `;
    const versionResult = await this.db.query(versionQuery, [data.design_id]);
    const nextVersion = versionResult.rows[0].max_version + 1;

    const query = `
      INSERT INTO design_versions (
        design_id, version_number, created_by, snapshot, description
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      data.design_id,
      nextVersion,
      data.created_by,
      JSON.stringify(data.snapshot),
      data.description,
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  // Get versions
  async getVersions(design_id: string): Promise<DesignVersion[]> {
    const query = `
      SELECT * FROM design_versions 
      WHERE design_id = $1 
      ORDER BY version_number DESC
    `;
    const result = await this.db.query(query, [design_id]);
    return result.rows;
  }

  // Restore version
  async restoreVersion(version_id: string): Promise<any> {
    const query = 'SELECT snapshot FROM design_versions WHERE id = $1';
    const result = await this.db.query(query, [version_id]);
    return result.rows[0]?.snapshot || null;
  }

  // Track change for notification
  async trackChange(data: {
    design_id: string;
    user_id: string;
    change_type: string;
    object_id?: string;
    description: string;
  }): Promise<void> {
    const query = `
      INSERT INTO design_change_log (
        design_id, user_id, change_type, object_id, description
      ) VALUES ($1, $2, $3, $4, $5)
    `;

    const values = [
      data.design_id,
      data.user_id,
      data.change_type,
      data.object_id || null,
      data.description,
    ];

    await this.db.query(query, values);

    // Broadcast change notification
    if (this.io) {
      this.io.to(`design:${data.design_id}`).emit('change:tracked', data);
    }
  }
}

export default new CollaborationService();

