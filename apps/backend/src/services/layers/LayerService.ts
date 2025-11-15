/**
 * Layer Management Service
 * Handles layer operations, grouping, and z-index management
 */

import { Pool } from 'pg';

export interface LayerReorderRequest {
  objectId: string;
  newZIndex: number;
}

export interface LayerGroupRequest {
  objectIds: string[];
  groupName?: string;
}

export interface LayerGroup {
  id: string;
  designId: string;
  name: string;
  objectIds: string[];
  parentGroupId?: string;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  createdAt: Date;
}

export class LayerService {
  constructor(private db: Pool) {}

  /**
   * Reorder layer (change z-index)
   */
  async reorderLayer(designId: string, objectId: string, newZIndex: number): Promise<void> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // Get current z-index
      const currentResult = await client.query(
        'SELECT z_index FROM design_objects WHERE id = $1 AND design_id = $2',
        [objectId, designId]
      );

      if (currentResult.rows.length === 0) {
        throw new Error('Object not found');
      }

      const currentZIndex = currentResult.rows[0].z_index;

      // Shift other objects
      if (newZIndex > currentZIndex) {
        // Moving up - shift down objects in between
        await client.query(
          `UPDATE design_objects 
           SET z_index = z_index - 1, updated_at = NOW()
           WHERE design_id = $1 AND z_index > $2 AND z_index <= $3`,
          [designId, currentZIndex, newZIndex]
        );
      } else if (newZIndex < currentZIndex) {
        // Moving down - shift up objects in between
        await client.query(
          `UPDATE design_objects 
           SET z_index = z_index + 1, updated_at = NOW()
           WHERE design_id = $1 AND z_index >= $2 AND z_index < $3`,
          [designId, newZIndex, currentZIndex]
        );
      }

      // Update object's z-index
      await client.query(
        'UPDATE design_objects SET z_index = $1, updated_at = NOW() WHERE id = $2',
        [newZIndex, objectId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Bring object forward (increase z-index by 1)
   */
  async bringForward(designId: string, objectId: string): Promise<void> {
    const result = await this.db.query(
      'SELECT z_index FROM design_objects WHERE id = $1 AND design_id = $2',
      [objectId, designId]
    );

    if (result.rows.length === 0) {
      throw new Error('Object not found');
    }

    const currentZIndex = result.rows[0].z_index;
    await this.reorderLayer(designId, objectId, currentZIndex + 1);
  }

  /**
   * Send object backward (decrease z-index by 1)
   */
  async sendBackward(designId: string, objectId: string): Promise<void> {
    const result = await this.db.query(
      'SELECT z_index FROM design_objects WHERE id = $1 AND design_id = $2',
      [objectId, designId]
    );

    if (result.rows.length === 0) {
      throw new Error('Object not found');
    }

    const currentZIndex = result.rows[0].z_index;
    if (currentZIndex > 0) {
      await this.reorderLayer(designId, objectId, currentZIndex - 1);
    }
  }

  /**
   * Bring to front (set to highest z-index)
   */
  async bringToFront(designId: string, objectId: string): Promise<void> {
    const result = await this.db.query(
      'SELECT MAX(z_index) as max_z FROM design_objects WHERE design_id = $1',
      [designId]
    );

    const maxZIndex = result.rows[0].max_z || 0;
    await this.reorderLayer(designId, objectId, maxZIndex);
  }

  /**
   * Send to back (set to lowest z-index)
   */
  async sendToBack(designId: string, objectId: string): Promise<void> {
    await this.reorderLayer(designId, objectId, 0);
  }

  /**
   * Create layer group
   */
  async createGroup(designId: string, objectIds: string[], groupName?: string): Promise<LayerGroup> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // Create group ID
      const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Update objects with group ID
      await client.query(
        `UPDATE design_objects 
         SET properties = jsonb_set(
           COALESCE(properties, '{}'::jsonb),
           '{groupId}',
           to_jsonb($1::text),
           true
         ),
         updated_at = NOW()
         WHERE design_id = $2 AND id = ANY($3)`,
        [groupId, designId, objectIds]
      );

      // Get average z-index for group
      const zIndexResult = await client.query(
        'SELECT AVG(z_index)::integer as avg_z FROM design_objects WHERE id = ANY($1)',
        [objectIds]
      );

      const group: LayerGroup = {
        id: groupId,
        designId,
        name: groupName || `Group ${groupId.slice(-8)}`,
        objectIds,
        zIndex: zIndexResult.rows[0].avg_z || 0,
        locked: false,
        visible: true,
        createdAt: new Date(),
      };

      await client.query('COMMIT');
      return group;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Ungroup layers
   */
  async ungroup(designId: string, groupId: string): Promise<void> {
    await this.db.query(
      `UPDATE design_objects 
       SET properties = properties - 'groupId',
       updated_at = NOW()
       WHERE design_id = $1 
       AND properties->>'groupId' = $2`,
      [designId, groupId]
    );
  }

  /**
   * Lock layer
   */
  async lockLayer(designId: string, objectId: string): Promise<void> {
    await this.db.query(
      'UPDATE design_objects SET locked = true, updated_at = NOW() WHERE design_id = $1 AND id = $2',
      [designId, objectId]
    );
  }

  /**
   * Unlock layer
   */
  async unlockLayer(designId: string, objectId: string): Promise<void> {
    await this.db.query(
      'UPDATE design_objects SET locked = false, updated_at = NOW() WHERE design_id = $1 AND id = $2',
      [designId, objectId]
    );
  }

  /**
   * Toggle layer visibility
   */
  async toggleVisibility(designId: string, objectId: string): Promise<boolean> {
    const result = await this.db.query(
      `UPDATE design_objects 
       SET visible = NOT visible, updated_at = NOW() 
       WHERE design_id = $1 AND id = $2 
       RETURNING visible`,
      [designId, objectId]
    );

    return result.rows[0]?.visible || false;
  }

  /**
   * Duplicate layer
   */
  async duplicateLayer(designId: string, objectId: string): Promise<any> {
    const result = await this.db.query(
      `INSERT INTO design_objects (
        design_id, type, x, y, width, height, rotation, opacity,
        z_index, locked, visible, name, properties
      )
      SELECT 
        design_id, type, x + 10, y + 10, width, height, rotation, opacity,
        (SELECT MAX(z_index) + 1 FROM design_objects WHERE design_id = $1),
        locked, visible, 
        name || ' (Copy)',
        properties
      FROM design_objects 
      WHERE id = $2 AND design_id = $1
      RETURNING *`,
      [designId, objectId]
    );

    return result.rows[0];
  }

  /**
   * Get layer hierarchy
   */
  async getLayerHierarchy(designId: string): Promise<any[]> {
    const result = await this.db.query(
      `SELECT 
        id, type, name, z_index, locked, visible,
        properties->>'groupId' as group_id
       FROM design_objects 
       WHERE design_id = $1 
       ORDER BY z_index ASC`,
      [designId]
    );

    return result.rows;
  }
}

