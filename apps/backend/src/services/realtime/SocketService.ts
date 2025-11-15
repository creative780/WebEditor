import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import DesignService from '../design/DesignService';
import { CreateObjectInput, UpdateObjectInput } from '../../models/DesignObject';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export class SocketService {
  public io: Server;
  private connectedUsers: Map<string, Set<string>> = new Map(); // designId -> Set of userIds

  constructor(server: HTTPServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        socket.userId = decoded.userId;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log('Client connected:', socket.id, 'User:', socket.userId);

      // Subscribe to design
      socket.on('design:subscribe', async (designId: string) => {
        try {
          if (!socket.userId) return;

          // Verify user has access to design
          const design = await DesignService.getDesignWithObjects(designId, socket.userId);
          if (!design) {
            socket.emit('error', { message: 'Design not found or access denied' });
            return;
          }

          // Join room
          socket.join(designId);
          
          // Track user presence
          if (!this.connectedUsers.has(designId)) {
            this.connectedUsers.set(designId, new Set());
          }
          this.connectedUsers.get(designId)!.add(socket.userId);

          // Send current state
          socket.emit('sync:state', {
            design: design.design,
            objects: design.objects,
          });

          // Notify others of user joining
          socket.to(designId).emit('user:joined', {
            userId: socket.userId,
            socketId: socket.id,
          });

          console.log(`User ${socket.userId} subscribed to design ${designId}`);
        } catch (error) {
          console.error('Error subscribing to design:', error);
          socket.emit('error', { message: 'Failed to subscribe to design' });
        }
      });

      // Create object
      socket.on('object:create', async ({ designId, object }: { designId: string; object: CreateObjectInput }) => {
        try {
          if (!socket.userId) return;

          const createdObject = await DesignService.createObject(designId, socket.userId, object);

          // Record change for undo/redo
          await DesignService.recordChange(designId, socket.userId, 'create', createdObject.id, null, createdObject);

          // Broadcast to all users in the design (including sender)
          this.io.to(designId).emit('object:created', {
            object: createdObject,
            userId: socket.userId,
          });

          console.log(`Object created in design ${designId}`);
        } catch (error) {
          console.error('Error creating object:', error);
          socket.emit('error', { message: 'Failed to create object' });
        }
      });

      // Update object
      socket.on('object:update', async ({ designId, objectId, updates }: { designId: string; objectId: string; updates: UpdateObjectInput }) => {
        try {
          if (!socket.userId) return;

          const updatedObject = await DesignService.updateObject(objectId, designId, socket.userId, updates);
          
          if (updatedObject) {
            // Record change for undo/redo
            await DesignService.recordChange(designId, socket.userId, 'update', objectId, null, updatedObject);

            // Broadcast to all users in the design
            this.io.to(designId).emit('object:updated', {
              objectId,
              updates: updatedObject,
              userId: socket.userId,
            });
          }
        } catch (error) {
          console.error('Error updating object:', error);
          socket.emit('error', { message: 'Failed to update object' });
        }
      });

      // Transform object (throttled, high-frequency updates)
      socket.on('object:transform', async ({ designId, objectId, transform }: { designId: string; objectId: string; transform: any }) => {
        try {
          if (!socket.userId) return;

          // Update position/size/rotation
          await DesignService.updateObject(objectId, designId, socket.userId, transform);

          // Broadcast transform only (no need to store in history for every transform)
          socket.to(designId).emit('object:transform', {
            objectId,
            transform,
            userId: socket.userId,
          });
        } catch (error) {
          console.error('Error transforming object:', error);
        }
      });

      // Delete object
      socket.on('object:delete', async ({ designId, objectId }: { designId: string; objectId: string }) => {
        try {
          if (!socket.userId) return;

          const deleted = await DesignService.deleteObject(objectId, designId, socket.userId);
          
          if (deleted) {
            // Record change for undo/redo
            await DesignService.recordChange(designId, socket.userId, 'delete', objectId, {}, null);

            // Broadcast to all users in the design
            this.io.to(designId).emit('object:deleted', {
              objectId,
              userId: socket.userId,
            });
          }
        } catch (error) {
          console.error('Error deleting object:', error);
          socket.emit('error', { message: 'Failed to delete object' });
        }
      });

      // Cursor movement
      socket.on('cursor:move', ({ designId, x, y }: { designId: string; x: number; y: number }) => {
        socket.to(designId).emit('cursor:update', {
          userId: socket.userId,
          socketId: socket.id,
          x,
          y,
        });
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Remove from all design rooms
        if (socket.userId) {
          this.connectedUsers.forEach((users, designId) => {
            if (users.has(socket.userId!)) {
              users.delete(socket.userId!);
              
              // Notify others
              socket.to(designId).emit('user:left', {
                userId: socket.userId,
                socketId: socket.id,
              });
            }
          });
        }
      });
    });
  }

  public getIO(): Server {
    return this.io;
  }
}

export default SocketService;

