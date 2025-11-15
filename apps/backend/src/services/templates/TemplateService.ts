/**
 * Template Service - Backend
 * Handles template CRUD operations, versioning, sharing, and marketplace
 */

import { Pool } from 'pg';
import pool from '../../config/database';

export interface Template {
  id: string;
  creator_id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  tags: string[];
  thumbnail_url: string;
  preview_url: string;
  design_data: any;
  is_public: boolean;
  is_premium: boolean;
  price: number;
  downloads: number;
  rating: number;
  review_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface TemplateVersion {
  id: string;
  template_id: string;
  version_number: number;
  description: string;
  design_data: any;
  created_by: string;
  created_at: Date;
}

export interface TemplateShare {
  id: string;
  template_id: string;
  share_token: string;
  expires_at: Date | null;
  password_hash: string | null;
  access_count: number;
  created_at: Date;
}

export class TemplateService {
  private db: Pool;

  constructor() {
    this.db = pool;
  }

  // Create template
  async createTemplate(data: {
    creator_id: string;
    name: string;
    description: string;
    category: string;
    industry: string;
    tags: string[];
    design_data: any;
    is_public?: boolean;
    is_premium?: boolean;
    price?: number;
  }): Promise<Template> {
    const query = `
      INSERT INTO templates (
        creator_id, name, description, category, industry, 
        tags, design_data, is_public, is_premium, price
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      data.creator_id,
      data.name,
      data.description,
      data.category,
      data.industry,
      data.tags,
      JSON.stringify(data.design_data),
      data.is_public || false,
      data.is_premium || false,
      data.price || 0,
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  // Get template by ID
  async getTemplateById(id: string): Promise<Template | null> {
    const query = 'SELECT * FROM templates WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  // List templates with filters
  async listTemplates(filters: {
    category?: string;
    industry?: string;
    is_public?: boolean;
    creator_id?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ templates: Template[]; total: number }> {
    let query = 'SELECT * FROM templates WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters.category) {
      query += ` AND category = $${paramCount++}`;
      values.push(filters.category);
    }

    if (filters.industry) {
      query += ` AND industry = $${paramCount++}`;
      values.push(filters.industry);
    }

    if (filters.is_public !== undefined) {
      query += ` AND is_public = $${paramCount++}`;
      values.push(filters.is_public);
    }

    if (filters.creator_id) {
      query += ` AND creator_id = $${paramCount++}`;
      values.push(filters.creator_id);
    }

    if (filters.search) {
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await this.db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(filters.limit || 20, filters.offset || 0);

    const result = await this.db.query(query, values);
    return { templates: result.rows, total };
  }

  // Update template
  async updateTemplate(
    id: string,
    data: Partial<Template>
  ): Promise<Template | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE templates 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  // Delete template
  async deleteTemplate(id: string): Promise<boolean> {
    const query = 'DELETE FROM templates WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.rowCount > 0;
  }

  // Create template version
  async createVersion(data: {
    template_id: string;
    description: string;
    design_data: any;
    created_by: string;
  }): Promise<TemplateVersion> {
    // Get current version number
    const versionQuery = `
      SELECT COALESCE(MAX(version_number), 0) as max_version 
      FROM template_versions 
      WHERE template_id = $1
    `;
    const versionResult = await this.db.query(versionQuery, [data.template_id]);
    const nextVersion = versionResult.rows[0].max_version + 1;

    const query = `
      INSERT INTO template_versions (
        template_id, version_number, description, design_data, created_by
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      data.template_id,
      nextVersion,
      data.description,
      JSON.stringify(data.design_data),
      data.created_by,
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  // Get template versions
  async getVersions(template_id: string): Promise<TemplateVersion[]> {
    const query = `
      SELECT * FROM template_versions 
      WHERE template_id = $1 
      ORDER BY version_number DESC
    `;
    const result = await this.db.query(query, [template_id]);
    return result.rows;
  }

  // Create share link
  async createShare(data: {
    template_id: string;
    expires_in?: number;
    password?: string;
  }): Promise<TemplateShare> {
    const share_token = this.generateShareToken();
    const expires_at = data.expires_in 
      ? new Date(Date.now() + data.expires_in) 
      : null;

    const query = `
      INSERT INTO template_shares (
        template_id, share_token, expires_at, password_hash
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      data.template_id,
      share_token,
      expires_at,
      data.password ? this.hashPassword(data.password) : null,
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  // Get share by token
  async getShareByToken(token: string): Promise<TemplateShare | null> {
    const query = 'SELECT * FROM template_shares WHERE share_token = $1';
    const result = await this.db.query(query, [token]);
    return result.rows[0] || null;
  }

  // Increment share access count
  async incrementShareAccess(share_id: string): Promise<void> {
    const query = `
      UPDATE template_shares 
      SET access_count = access_count + 1 
      WHERE id = $1
    `;
    await this.db.query(query, [share_id]);
  }

  // Track template analytics
  async trackAnalytics(template_id: string, event: 'view' | 'use' | 'download'): Promise<void> {
    const query = `
      INSERT INTO template_analytics (template_id, event_type, created_at)
      VALUES ($1, $2, NOW())
    `;
    await this.db.query(query, [template_id, event]);

    // Update template counters
    if (event === 'download') {
      await this.db.query(
        'UPDATE templates SET downloads = downloads + 1 WHERE id = $1',
        [template_id]
      );
    }
  }

  // Get template analytics
  async getAnalytics(template_id: string): Promise<{
    views: number;
    uses: number;
    downloads: number;
    favorites: number;
  }> {
    const query = `
      SELECT 
        COUNT(CASE WHEN event_type = 'view' THEN 1 END) as views,
        COUNT(CASE WHEN event_type = 'use' THEN 1 END) as uses,
        COUNT(CASE WHEN event_type = 'download' THEN 1 END) as downloads
      FROM template_analytics
      WHERE template_id = $1
    `;
    
    const result = await this.db.query(query, [template_id]);
    const favQuery = 'SELECT COUNT(*) as count FROM template_favorites WHERE template_id = $1';
    const favResult = await this.db.query(favQuery, [template_id]);

    return {
      ...result.rows[0],
      favorites: parseInt(favResult.rows[0].count),
    };
  }

  // Get trending templates
  async getTrendingTemplates(limit: number = 10): Promise<Template[]> {
    const query = `
      SELECT t.*, COUNT(ta.id) as recent_activity
      FROM templates t
      LEFT JOIN template_analytics ta ON t.id = ta.template_id 
        AND ta.created_at > NOW() - INTERVAL '7 days'
      WHERE t.is_public = true
      GROUP BY t.id
      ORDER BY recent_activity DESC, t.downloads DESC
      LIMIT $1
    `;
    
    const result = await this.db.query(query, [limit]);
    return result.rows;
  }

  // Helper: Generate share token
  private generateShareToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Helper: Hash password (simplified - use bcrypt in production)
  private hashPassword(password: string): string {
    // TODO: Use bcrypt in production
    return Buffer.from(password).toString('base64');
  }
}

export default new TemplateService();

