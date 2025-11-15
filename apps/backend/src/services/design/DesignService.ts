import pool from '../../config/database';
import { Design, CreateDesignInput, UpdateDesignInput } from '../../models/Design';
import { DesignObject, CreateObjectInput, UpdateObjectInput } from '../../models/DesignObject';
import { v4 as uuidv4 } from 'uuid';

export class DesignService {
  // Create a new design
  async createDesign(userId: string, input: CreateDesignInput): Promise<Design> {
    const result = await pool.query(
      `INSERT INTO designs (user_id, name, width, height, unit, dpi, bleed, color_mode)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        input.name,
        input.width,
        input.height,
        input.unit || 'in',
        input.dpi || 300,
        input.bleed || 0.125,
        input.color_mode || 'rgb',
      ]
    );

    return result.rows[0];
  }

  // Get design by ID
  async getDesign(designId: string, userId: string): Promise<Design | null> {
    const result = await pool.query(
      `SELECT * FROM designs WHERE id = $1 AND user_id = $2`,
      [designId, userId]
    );

    return result.rows[0] || null;
  }

  // Get design with all objects
  async getDesignWithObjects(designId: string, userId: string): Promise<{ design: Design; objects: DesignObject[] } | null> {
    const designResult = await pool.query(
      `SELECT * FROM designs WHERE id = $1 AND user_id = $2`,
      [designId, userId]
    );

    if (designResult.rows.length === 0) {
      return null;
    }

    const objectsResult = await pool.query(
      `SELECT * FROM design_objects WHERE design_id = $1 ORDER BY z_index ASC`,
      [designId]
    );

    return {
      design: designResult.rows[0],
      objects: objectsResult.rows.map(row => ({
        ...row,
        properties: row.properties,
      })),
    };
  }

  // List user's designs
  async listDesigns(userId: string): Promise<Design[]> {
    const result = await pool.query(
      `SELECT * FROM designs WHERE user_id = $1 ORDER BY updated_at DESC`,
      [userId]
    );

    return result.rows;
  }

  // Update design
  async updateDesign(designId: string, userId: string, input: UpdateDesignInput): Promise<Design | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.getDesign(designId, userId);
    }

    fields.push(`updated_at = NOW()`);
    fields.push(`last_edited_by = $${paramCount}`);
    values.push(userId);
    paramCount++;

    values.push(designId, userId);

    const result = await pool.query(
      `UPDATE designs SET ${fields.join(', ')}
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  // Delete design
  async deleteDesign(designId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM designs WHERE id = $1 AND user_id = $2`,
      [designId, userId]
    );

    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Create object
  async createObject(designId: string, userId: string, input: CreateObjectInput): Promise<DesignObject> {
    console.log('[DesignService] Creating object for design:', designId, 'type:', input.type);
    // Verify design ownership
    const design = await this.getDesign(designId, userId);
    if (!design) {
      console.error('[DesignService] Design not found:', designId);
      throw new Error('Design not found');
    }

    // Get max z-index
    const maxZResult = await pool.query(
      `SELECT COALESCE(MAX(z_index), -1) as max_z FROM design_objects WHERE design_id = $1`,
      [designId]
    );
    const zIndex = maxZResult.rows[0].max_z + 1;

    // Use provided coordinates (frontend calculates positioning)
    const x = input.x !== undefined ? input.x : (design.width / 2 - input.width / 2);
    const y = input.y !== undefined ? input.y : (design.height / 2 - input.height / 2);

    const propertiesJson = typeof input.properties === 'string' ? input.properties : JSON.stringify(input.properties);
    
    const result = await pool.query(
      `INSERT INTO design_objects 
       (design_id, type, x, y, width, height, rotation, opacity, z_index, locked, visible, name, properties)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        designId,
        input.type,
        x,
        y,
        input.width,
        input.height,
        input.rotation || 0,
        input.opacity || 1,
        zIndex,
        input.locked || false,
        input.visible !== false,
        input.name || `${input.type}-${Date.now()}`,
        propertiesJson,
      ]
    );

    console.log('[DesignService] Object created with ID:', result.rows[0].id);
    return result.rows[0];
  }

  // Update object
  async updateObject(objectId: string, designId: string, userId: string, input: UpdateObjectInput): Promise<DesignObject | null> {
    // Verify design ownership
    const design = await this.getDesign(designId, userId);
    if (!design) {
      throw new Error('Design not found');
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'properties') {
          // Replace properties completely (frontend sends complete properties object)
          fields.push(`properties = $${paramCount}::jsonb`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = NOW()`);
    values.push(objectId, designId);

    const result = await pool.query(
      `UPDATE design_objects SET ${fields.join(', ')}
       WHERE id = $${paramCount} AND design_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  // Delete object
  async deleteObject(objectId: string, designId: string, userId: string): Promise<boolean> {
    // Verify design ownership
    const design = await this.getDesign(designId, userId);
    if (!design) {
      throw new Error('Design not found');
    }

    const result = await pool.query(
      `DELETE FROM design_objects WHERE id = $1 AND design_id = $2`,
      [objectId, designId]
    );

    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Record change for undo/redo
  async recordChange(
    designId: string,
    userId: string,
    operation: string,
    objectId: string | null,
    beforeState: any,
    afterState: any
  ): Promise<void> {
    await pool.query(
      `INSERT INTO design_changes (design_id, user_id, operation, object_id, before_state, after_state)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [designId, userId, operation, objectId, JSON.stringify(beforeState), JSON.stringify(afterState)]
    );
  }
}

export default new DesignService();

