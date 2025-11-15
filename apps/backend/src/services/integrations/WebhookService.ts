/**
 * Webhook Service - Event Notifications
 * Send webhooks for design events
 */

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
}

export class WebhookService {
  private webhooks: Map<string, Webhook> = new Map();

  async register(url: string, events: string[]): Promise<Webhook> {
    const id = `webhook_${Date.now()}`;
    const webhook: Webhook = {
      id,
      url,
      events,
      secret: this.generateSecret(),
      enabled: true
    };
    this.webhooks.set(id, webhook);
    return webhook;
  }

  async trigger(event: string, payload: any): Promise<void> {
    const webhooks = Array.from(this.webhooks.values())
      .filter(w => w.enabled && w.events.includes(event));

    for (const webhook of webhooks) {
      try {
        await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': this.sign(payload, webhook.secret)
          },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        console.error(`Webhook ${webhook.id} failed:`, error);
      }
    }
  }

  private generateSecret(): string {
    return Math.random().toString(36).substr(2, 16);
  }

  private sign(payload: any, secret: string): string {
    // In production, use HMAC-SHA256
    return 'signature';
  }
}

export const webhookService = new WebhookService();

