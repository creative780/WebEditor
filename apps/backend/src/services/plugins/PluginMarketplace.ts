/**
 * Plugin Marketplace - Discovery & Installation
 */

export interface MarketplacePlugin {
  id: string;
  name: string;
  description: string;
  downloads: number;
  rating: number;
  featured: boolean;
}

export class PluginMarketplace {
  private marketplace: MarketplacePlugin[] = [];

  async listFeatured(): Promise<MarketplacePlugin[]> {
    return this.marketplace.filter(p => p.featured);
  }

  async search(query: string): Promise<MarketplacePlugin[]> {
    return this.marketplace.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getPopular(limit: number = 10): Promise<MarketplacePlugin[]> {
    return [...this.marketplace]
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit);
  }
}

export const pluginMarketplace = new PluginMarketplace();

