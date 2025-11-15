import pool from '../../config/database';
import { DesignObject } from '../../models/DesignObject';

export class TransformService {
  // Align objects
  async alignObjects(
    designId: string,
    objectIds: string[],
    alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
  ): Promise<DesignObject[]> {
    if (objectIds.length < 2) {
      throw new Error('At least 2 objects required for alignment');
    }

    // Get all objects
    const result = await pool.query(
      `SELECT * FROM design_objects WHERE id = ANY($1) AND design_id = $2`,
      [objectIds, designId]
    );

    const objects = result.rows;

    // Calculate bounds
    const left = Math.min(...objects.map(obj => obj.x));
    const right = Math.max(...objects.map(obj => obj.x + obj.width));
    const top = Math.min(...objects.map(obj => obj.y));
    const bottom = Math.max(...objects.map(obj => obj.y + obj.height));
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;

    // Update objects
    const updates = objects.map(obj => {
      let newX = obj.x;
      let newY = obj.y;

      switch (alignment) {
        case 'left':
          newX = left;
          break;
        case 'center':
          newX = centerX - obj.width / 2;
          break;
        case 'right':
          newX = right - obj.width;
          break;
        case 'top':
          newY = top;
          break;
        case 'middle':
          newY = centerY - obj.height / 2;
          break;
        case 'bottom':
          newY = bottom - obj.height;
          break;
      }

      return { id: obj.id, x: newX, y: newY };
    });

    // Batch update
    for (const update of updates) {
      await pool.query(
        `UPDATE design_objects SET x = $1, y = $2, updated_at = NOW() WHERE id = $3`,
        [update.x, update.y, update.id]
      );
    }

    // Return updated objects
    const updatedResult = await pool.query(
      `SELECT * FROM design_objects WHERE id = ANY($1)`,
      [objectIds]
    );

    return updatedResult.rows;
  }

  // Distribute objects
  async distributeObjects(
    designId: string,
    objectIds: string[],
    direction: 'horizontal' | 'vertical'
  ): Promise<DesignObject[]> {
    if (objectIds.length < 3) {
      throw new Error('At least 3 objects required for distribution');
    }

    // Get all objects
    const result = await pool.query(
      `SELECT * FROM design_objects WHERE id = ANY($1) AND design_id = $2 ORDER BY ${direction === 'horizontal' ? 'x' : 'y'}`,
      [objectIds, designId]
    );

    const objects = result.rows;

    if (direction === 'horizontal') {
      const totalWidth = objects.reduce((sum, obj) => sum + obj.width, 0);
      const totalSpace = objects[objects.length - 1].x + objects[objects.length - 1].width - objects[0].x;
      const spacing = (totalSpace - totalWidth) / (objects.length - 1);

      let currentX = objects[0].x;
      for (let i = 0; i < objects.length; i++) {
        if (i > 0) {
          currentX += objects[i - 1].width + spacing;
          await pool.query(
            `UPDATE design_objects SET x = $1, updated_at = NOW() WHERE id = $2`,
            [currentX, objects[i].id]
          );
        }
      }
    } else {
      const totalHeight = objects.reduce((sum, obj) => sum + obj.height, 0);
      const totalSpace = objects[objects.length - 1].y + objects[objects.length - 1].height - objects[0].y;
      const spacing = (totalSpace - totalHeight) / (objects.length - 1);

      let currentY = objects[0].y;
      for (let i = 0; i < objects.length; i++) {
        if (i > 0) {
          currentY += objects[i - 1].height + spacing;
          await pool.query(
            `UPDATE design_objects SET y = $1, updated_at = NOW() WHERE id = $2`,
            [currentY, objects[i].id]
          );
        }
      }
    }

    // Return updated objects
    const updatedResult = await pool.query(
      `SELECT * FROM design_objects WHERE id = ANY($1)`,
      [objectIds]
    );

    return updatedResult.rows;
  }

  // Align to canvas
  async alignToCanvas(
    designId: string,
    objectIds: string[],
    alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
  ): Promise<DesignObject[]> {
    // Get design dimensions
    const designResult = await pool.query(
      `SELECT width, height FROM designs WHERE id = $1`,
      [designId]
    );

    if (designResult.rows.length === 0) {
      throw new Error('Design not found');
    }

    const { width: canvasWidth, height: canvasHeight } = designResult.rows[0];

    // Get all objects
    const result = await pool.query(
      `SELECT * FROM design_objects WHERE id = ANY($1) AND design_id = $2`,
      [objectIds, designId]
    );

    const objects = result.rows;

    // Update objects
    for (const obj of objects) {
      let newX = obj.x;
      let newY = obj.y;

      switch (alignment) {
        case 'left':
          newX = 0;
          break;
        case 'center':
          newX = (canvasWidth - obj.width) / 2;
          break;
        case 'right':
          newX = canvasWidth - obj.width;
          break;
        case 'top':
          newY = 0;
          break;
        case 'middle':
          newY = (canvasHeight - obj.height) / 2;
          break;
        case 'bottom':
          newY = canvasHeight - obj.height;
          break;
      }

      await pool.query(
        `UPDATE design_objects SET x = $1, y = $2, updated_at = NOW() WHERE id = $3`,
        [newX, newY, obj.id]
      );
    }

    // Return updated objects
    const updatedResult = await pool.query(
      `SELECT * FROM design_objects WHERE id = ANY($1)`,
      [objectIds]
    );

    return updatedResult.rows;
  }

  // Group objects
  async groupObjects(designId: string, objectIds: string[]): Promise<{ groupId: string; objects: DesignObject[] }> {
    // For now, we'll just return the objects
    // Full grouping implementation would create a group entity
    const result = await pool.query(
      `SELECT * FROM design_objects WHERE id = ANY($1) AND design_id = $2`,
      [objectIds, designId]
    );

    return {
      groupId: `group-${Date.now()}`,
      objects: result.rows,
    };
  }
}

export default new TransformService();

