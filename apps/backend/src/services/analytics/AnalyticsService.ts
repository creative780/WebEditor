/**
 * Usage Analytics Service
 * Tracks user behavior and feature usage
 */

import { Pool } from 'pg';

export interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  designId?: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

export interface UsageStats {
  totalUsers: number;
  activeUsers: number;
  totalDesigns: number;
  totalObjects: number;
  popularFeatures: { feature: string; count: number }[];
}

export class AnalyticsService {
  constructor(private db: Pool) {}

  /**
   * Track analytics event
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO analytics_events (event_name, user_id, design_id, properties, timestamp)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          event.eventName,
          event.userId || null,
          event.designId || null,
          JSON.stringify(event.properties || {}),
          event.timestamp,
        ]
      );
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  /**
   * Track feature usage
   */
  async trackFeatureUsage(userId: string, feature: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      eventName: 'feature_used',
      userId,
      properties: {
        feature,
        ...properties,
      },
      timestamp: new Date(),
    });
  }

  /**
   * Track design action
   */
  async trackDesignAction(
    userId: string,
    designId: string,
    action: string,
    properties?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      eventName: `design_${action}`,
      userId,
      designId,
      properties,
      timestamp: new Date(),
    });
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(startDate?: Date, endDate?: Date): Promise<UsageStats> {
    const dateFilter = startDate && endDate
      ? `AND timestamp BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'`
      : '';

    // Total users (would need users table)
    const totalUsersResult = await this.db.query(
      `SELECT COUNT(DISTINCT user_id) as count FROM analytics_events WHERE user_id IS NOT NULL ${dateFilter}`
    );

    // Active users (last 30 days)
    const activeUsersResult = await this.db.query(
      `SELECT COUNT(DISTINCT user_id) as count FROM analytics_events 
       WHERE user_id IS NOT NULL AND timestamp > NOW() - INTERVAL '30 days'`
    );

    // Total designs
    const totalDesignsResult = await this.db.query(
      `SELECT COUNT(*) as count FROM designs`
    );

    // Total objects
    const totalObjectsResult = await this.db.query(
      `SELECT COUNT(*) as count FROM design_objects`
    );

    // Popular features
    const popularFeaturesResult = await this.db.query(
      `SELECT 
        properties->>'feature' as feature,
        COUNT(*) as count
       FROM analytics_events 
       WHERE event_name = 'feature_used' ${dateFilter}
       GROUP BY properties->>'feature'
       ORDER BY count DESC
       LIMIT 10`
    );

    return {
      totalUsers: parseInt(totalUsersResult.rows[0]?.count || '0'),
      activeUsers: parseInt(activeUsersResult.rows[0]?.count || '0'),
      totalDesigns: parseInt(totalDesignsResult.rows[0]?.count || '0'),
      totalObjects: parseInt(totalObjectsResult.rows[0]?.count || '0'),
      popularFeatures: popularFeaturesResult.rows.map(row => ({
        feature: row.feature,
        count: parseInt(row.count),
      })),
    };
  }

  /**
   * Get user activity
   */
  async getUserActivity(userId: string, limit: number = 50): Promise<AnalyticsEvent[]> {
    const result = await this.db.query(
      `SELECT event_name, design_id, properties, timestamp
       FROM analytics_events
       WHERE user_id = $1
       ORDER BY timestamp DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map(row => ({
      eventName: row.event_name,
      userId,
      designId: row.design_id,
      properties: row.properties,
      timestamp: row.timestamp,
    }));
  }

  /**
   * Get design analytics
   */
  async getDesignAnalytics(designId: string): Promise<Record<string, any>> {
    // Edit count
    const editsResult = await this.db.query(
      `SELECT COUNT(*) as count FROM design_changes WHERE design_id = $1`,
      [designId]
    );

    // Collaborators
    const collaboratorsResult = await this.db.query(
      `SELECT COUNT(DISTINCT user_id) as count FROM design_changes WHERE design_id = $1`,
      [designId]
    );

    // Last edited
    const lastEditedResult = await this.db.query(
      `SELECT MAX(timestamp) as last_edited FROM design_changes WHERE design_id = $1`,
      [designId]
    );

    return {
      editCount: parseInt(editsResult.rows[0]?.count || '0'),
      collaboratorCount: parseInt(collaboratorsResult.rows[0]?.count || '0'),
      lastEdited: lastEditedResult.rows[0]?.last_edited,
    };
  }

  /**
   * Get popular templates
   */
  async getPopularTemplates(limit: number = 10): Promise<any[]> {
    const result = await this.db.query(
      `SELECT 
        design_id as template_id,
        COUNT(*) as usage_count
       FROM analytics_events
       WHERE event_name = 'template_applied'
       GROUP BY design_id
       ORDER BY usage_count DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }

  /**
   * Clean old analytics data
   */
  async cleanOldData(daysToKeep: number = 90): Promise<void> {
    await this.db.query(
      `DELETE FROM analytics_events 
       WHERE timestamp < NOW() - INTERVAL '${daysToKeep} days'`
    );
  }
}

