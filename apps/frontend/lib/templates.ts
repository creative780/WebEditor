/**
 * Industry-Specific Templates System
 * Professional templates for different business sectors
 */

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  industry: string;
  description: string;
  thumbnail: string;
  specs: TemplateSpecs;
  elements: TemplateElement[];
  tags: string[];
  popularity: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TemplateCategory = 
  | 'business-cards'
  | 'flyers'
  | 'brochures'
  | 'posters'
  | 'menus'
  | 'invitations'
  | 'certificates'
  | 'banners'
  | 'letterheads'
  | 'presentations';

export interface TemplateSpecs {
  width: number;
  height: number;
  unit: 'px' | 'mm' | 'in';
  dpi: number;
  bleed: number;
  colorMode: 'CMYK' | 'RGB';
  orientation: 'portrait' | 'landscape' | 'square';
}

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'path';
  x: number;
  y: number;
  width: number;
  height: number;
  properties: any;
  editable: boolean;
  placeholder?: string;
}

// Restaurant Industry Templates
export const RESTAURANT_TEMPLATES: Template[] = [
  {
    id: 'restaurant-menu-classic',
    name: 'Classic Restaurant Menu',
    category: 'menus',
    industry: 'restaurant',
    description: 'Elegant menu design with appetizers, mains, and desserts sections',
    thumbnail: '/templates/restaurant-menu-classic.jpg',
    specs: {
      width: 8.5,
      height: 11,
      unit: 'in',
      dpi: 300,
      bleed: 0.125,
      colorMode: 'CMYK',
      orientation: 'portrait'
    },
    elements: [
      {
        id: 'restaurant-name',
        type: 'text',
        x: 1,
        y: 0.5,
        width: 6.5,
        height: 1,
        properties: {
          text: 'Restaurant Name',
          fontSize: 36,
          fontFamily: 'Playfair Display',
          fontWeight: 700,
          color: '#2C3E50',
          textAlign: 'center'
        },
        editable: true,
        placeholder: 'Enter restaurant name'
      },
      {
        id: 'appetizers-section',
        type: 'text',
        x: 1,
        y: 2,
        width: 6.5,
        height: 0.5,
        properties: {
          text: 'APPETIZERS',
          fontSize: 18,
          fontFamily: 'Open Sans',
          fontWeight: 600,
          color: '#E74C3C',
          textAlign: 'left'
        },
        editable: true
      }
    ],
    tags: ['restaurant', 'menu', 'food', 'elegant', 'classic'],
    popularity: 95,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'restaurant-business-card',
    name: 'Restaurant Business Card',
    category: 'business-cards',
    industry: 'restaurant',
    description: 'Professional business card with restaurant branding',
    thumbnail: '/templates/restaurant-business-card.jpg',
    specs: {
      width: 3.5,
      height: 2,
      unit: 'in',
      dpi: 300,
      bleed: 0.125,
      colorMode: 'CMYK',
      orientation: 'landscape'
    },
    elements: [
      {
        id: 'restaurant-logo',
        type: 'image',
        x: 0.25,
        y: 0.25,
        width: 1,
        height: 1,
        properties: {
          src: '/placeholders/restaurant-logo.png',
          alt: 'Restaurant Logo'
        },
        editable: true
      },
      {
        id: 'restaurant-name-card',
        type: 'text',
        x: 1.5,
        y: 0.3,
        width: 1.75,
        height: 0.4,
        properties: {
          text: 'Restaurant Name',
          fontSize: 16,
          fontFamily: 'Playfair Display',
          fontWeight: 700,
          color: '#2C3E50',
          textAlign: 'left'
        },
        editable: true,
        placeholder: 'Enter restaurant name'
      }
    ],
    tags: ['restaurant', 'business-card', 'professional', 'branding'],
    popularity: 88,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Real Estate Industry Templates
export const REAL_ESTATE_TEMPLATES: Template[] = [
  {
    id: 'property-flyer-luxury',
    name: 'Luxury Property Flyer',
    category: 'flyers',
    industry: 'real-estate',
    description: 'High-end property marketing flyer with photo showcase',
    thumbnail: '/templates/property-flyer-luxury.jpg',
    specs: {
      width: 8.5,
      height: 11,
      unit: 'in',
      dpi: 300,
      bleed: 0.125,
      colorMode: 'CMYK',
      orientation: 'portrait'
    },
    elements: [
      {
        id: 'property-image',
        type: 'image',
        x: 0.5,
        y: 0.5,
        width: 7.5,
        height: 5,
        properties: {
          src: '/placeholders/luxury-property.jpg',
          alt: 'Luxury Property'
        },
        editable: true
      },
      {
        id: 'property-title',
        type: 'text',
        x: 0.5,
        y: 6,
        width: 7.5,
        height: 0.8,
        properties: {
          text: 'Luxury Property Title',
          fontSize: 28,
          fontFamily: 'Montserrat',
          fontWeight: 700,
          color: '#2C3E50',
          textAlign: 'center'
        },
        editable: true,
        placeholder: 'Enter property title'
      },
      {
        id: 'price-tag',
        type: 'shape',
        x: 6,
        y: 0.5,
        width: 2,
        height: 0.8,
        properties: {
          shape: 'rectangle',
          fill: { type: 'solid', color: '#E74C3C' },
          stroke: { width: 0, color: '#E74C3C' }
        },
        editable: true
      },
      {
        id: 'price-text',
        type: 'text',
        x: 6.1,
        y: 0.6,
        width: 1.8,
        height: 0.6,
        properties: {
          text: '$1,250,000',
          fontSize: 18,
          fontFamily: 'Montserrat',
          fontWeight: 700,
          color: '#FFFFFF',
          textAlign: 'center'
        },
        editable: true,
        placeholder: 'Enter price'
      }
    ],
    tags: ['real-estate', 'luxury', 'property', 'marketing', 'flyer'],
    popularity: 92,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Medical Industry Templates
export const MEDICAL_TEMPLATES: Template[] = [
  {
    id: 'medical-brochure',
    name: 'Medical Practice Brochure',
    category: 'brochures',
    industry: 'medical',
    description: 'Professional medical practice brochure with services and contact info',
    thumbnail: '/templates/medical-brochure.jpg',
    specs: {
      width: 8.5,
      height: 11,
      unit: 'in',
      dpi: 300,
      bleed: 0.125,
      colorMode: 'CMYK',
      orientation: 'portrait'
    },
    elements: [
      {
        id: 'medical-logo',
        type: 'image',
        x: 0.5,
        y: 0.5,
        width: 2,
        height: 1,
        properties: {
          src: '/placeholders/medical-logo.png',
          alt: 'Medical Practice Logo'
        },
        editable: true
      },
      {
        id: 'practice-name',
        type: 'text',
        x: 2.8,
        y: 0.6,
        width: 5,
        height: 0.7,
        properties: {
          text: 'Medical Practice Name',
          fontSize: 24,
          fontFamily: 'Roboto',
          fontWeight: 700,
          color: '#2C3E50',
          textAlign: 'left'
        },
        editable: true,
        placeholder: 'Enter practice name'
      },
      {
        id: 'services-title',
        type: 'text',
        x: 0.5,
        y: 2,
        width: 7.5,
        height: 0.5,
        properties: {
          text: 'OUR SERVICES',
          fontSize: 20,
          fontFamily: 'Roboto',
          fontWeight: 600,
          color: '#3498DB',
          textAlign: 'left'
        },
        editable: true
      }
    ],
    tags: ['medical', 'healthcare', 'professional', 'brochure', 'services'],
    popularity: 85,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// All templates combined
export const ALL_TEMPLATES: Template[] = [
  ...RESTAURANT_TEMPLATES,
  ...REAL_ESTATE_TEMPLATES,
  ...MEDICAL_TEMPLATES
];

// Template categories
export const TEMPLATE_CATEGORIES = [
  { id: 'business-cards', name: 'Business Cards', icon: '💼' },
  { id: 'flyers', name: 'Flyers', icon: '📄' },
  { id: 'brochures', name: 'Brochures', icon: '📋' },
  { id: 'posters', name: 'Posters', icon: '🖼️' },
  { id: 'menus', name: 'Menus', icon: '🍽️' },
  { id: 'invitations', name: 'Invitations', icon: '💌' },
  { id: 'certificates', name: 'Certificates', icon: '🏆' },
  { id: 'banners', name: 'Banners', icon: '🚩' },
  { id: 'letterheads', name: 'Letterheads', icon: '📝' },
  { id: 'presentations', name: 'Presentations', icon: '📊' }
];

// Industries
export const INDUSTRIES = [
  { id: 'restaurant', name: 'Restaurant & Food', icon: '🍽️' },
  { id: 'real-estate', name: 'Real Estate', icon: '🏠' },
  { id: 'medical', name: 'Medical & Healthcare', icon: '🏥' },
  { id: 'retail', name: 'Retail & E-commerce', icon: '🛍️' },
  { id: 'education', name: 'Education', icon: '🎓' },
  { id: 'fitness', name: 'Fitness & Wellness', icon: '💪' },
  { id: 'beauty', name: 'Beauty & Spa', icon: '💄' },
  { id: 'automotive', name: 'Automotive', icon: '🚗' },
  { id: 'legal', name: 'Legal Services', icon: '⚖️' },
  { id: 'finance', name: 'Finance & Insurance', icon: '💰' }
];

export class TemplateManager {
  private static instance: TemplateManager;

  static getInstance(): TemplateManager {
    if (!TemplateManager.instance) {
      TemplateManager.instance = new TemplateManager();
    }
    return TemplateManager.instance;
  }

  // Get templates by industry
  getTemplatesByIndustry(industry: string): Template[] {
    return ALL_TEMPLATES.filter(template => template.industry === industry);
  }

  // Get templates by category
  getTemplatesByCategory(category: TemplateCategory): Template[] {
    return ALL_TEMPLATES.filter(template => template.category === category);
  }

  // Search templates
  searchTemplates(query: string): Template[] {
    const lowerQuery = query.toLowerCase();
    return ALL_TEMPLATES.filter(template => 
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Get popular templates
  getPopularTemplates(limit: number = 10): Template[] {
    return ALL_TEMPLATES
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  // Get template by ID
  getTemplateById(id: string): Template | undefined {
    return ALL_TEMPLATES.find(template => template.id === id);
  }

  // Apply template to document
  applyTemplate(templateId: string, documentId: string): {
    success: boolean;
    elements: TemplateElement[];
    specs: TemplateSpecs;
    error?: string;
  } {
    const template = this.getTemplateById(templateId);
    
    if (!template) {
      return {
        success: false,
        elements: [],
        specs: {
          width: 8.5,
          height: 11,
          unit: 'in',
          dpi: 300,
          bleed: 0.125,
          colorMode: 'CMYK',
          orientation: 'portrait'
        },
        error: 'Template not found'
      };
    }

    return {
      success: true,
      elements: template.elements,
      specs: template.specs
    };
  }

  // Get template recommendations based on industry
  getRecommendations(industry: string, category?: TemplateCategory): Template[] {
    let templates = this.getTemplatesByIndustry(industry);
    
    if (category) {
      templates = templates.filter(template => template.category === category);
    }

    return templates.sort((a, b) => b.popularity - a.popularity);
  }

  // Get all available industries
  getIndustries(): typeof INDUSTRIES {
    return INDUSTRIES;
  }

  // Get all available categories
  getCategories(): typeof TEMPLATE_CATEGORIES {
    return TEMPLATE_CATEGORIES;
  }

  // Create custom template from current design
  createCustomTemplate(
    name: string,
    description: string,
    category: TemplateCategory,
    industry: string,
    objects: any[],
    specs: TemplateSpecs
  ): Template {
    const template: Template = {
      id: `custom-${Date.now()}`,
      name,
      category,
      industry,
      description,
      thumbnail: '', // Would be generated from canvas
      specs,
      elements: objects.map(obj => ({
        id: obj.id,
        type: obj.type,
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height,
        properties: obj,
        editable: true,
      })),
      tags: [category, industry, 'custom'],
      popularity: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Save to local storage
    this.saveCustomTemplate(template);
    return template;
  }

  // Save custom template
  private saveCustomTemplate(template: Template): void {
    const customTemplates = this.getCustomTemplates();
    customTemplates.push(template);
    localStorage.setItem('custom_templates', JSON.stringify(customTemplates));
  }

  // Get custom templates
  getCustomTemplates(): Template[] {
    const stored = localStorage.getItem('custom_templates');
    return stored ? JSON.parse(stored) : [];
  }

  // Delete custom template
  deleteCustomTemplate(id: string): boolean {
    const customTemplates = this.getCustomTemplates();
    const filtered = customTemplates.filter(t => t.id !== id);
    localStorage.setItem('custom_templates', JSON.stringify(filtered));
    return true;
  }

  // Get all templates including custom
  getAllTemplates(): Template[] {
    return [...ALL_TEMPLATES, ...this.getCustomTemplates()];
  }
}

// Template versioning system
export interface TemplateVersion {
  id: string;
  templateId: string;
  version: number;
  description: string;
  createdAt: Date;
  createdBy: string;
  data: Template;
}

export class TemplateVersionManager {
  private static instance: TemplateVersionManager;

  static getInstance(): TemplateVersionManager {
    if (!TemplateVersionManager.instance) {
      TemplateVersionManager.instance = new TemplateVersionManager();
    }
    return TemplateVersionManager.instance;
  }

  // Create new version
  createVersion(
    templateId: string,
    description: string,
    template: Template
  ): TemplateVersion {
    const versions = this.getVersions(templateId);
    const version: TemplateVersion = {
      id: `version-${Date.now()}`,
      templateId,
      version: versions.length + 1,
      description,
      createdAt: new Date(),
      createdBy: 'current-user',
      data: template,
    };
    
    versions.push(version);
    localStorage.setItem(`template_versions_${templateId}`, JSON.stringify(versions));
    return version;
  }

  // Get all versions for a template
  getVersions(templateId: string): TemplateVersion[] {
    const stored = localStorage.getItem(`template_versions_${templateId}`);
    return stored ? JSON.parse(stored) : [];
  }

  // Restore specific version
  restoreVersion(versionId: string, templateId: string): Template | null {
    const versions = this.getVersions(templateId);
    const version = versions.find(v => v.id === versionId);
    return version ? version.data : null;
  }
}

// Template sharing system
export interface SharedTemplate {
  id: string;
  templateId: string;
  shareUrl: string;
  expiresAt: Date | null;
  password: string | null;
  accessCount: number;
  createdAt: Date;
}

export class TemplateShareManager {
  private static instance: TemplateShareManager;

  static getInstance(): TemplateShareManager {
    if (!TemplateShareManager.instance) {
      TemplateShareManager.instance = new TemplateShareManager();
    }
    return TemplateShareManager.instance;
  }

  // Create share link
  createShareLink(
    templateId: string,
    expiresIn?: number,
    password?: string
  ): SharedTemplate {
    const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const share: SharedTemplate = {
      id: shareId,
      templateId,
      shareUrl: `${window.location.origin}/templates/shared/${shareId}`,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : null,
      password: password || null,
      accessCount: 0,
      createdAt: new Date(),
    };
    
    const shares = this.getShares();
    shares.push(share);
    localStorage.setItem('template_shares', JSON.stringify(shares));
    return share;
  }

  // Get all shares
  private getShares(): SharedTemplate[] {
    const stored = localStorage.getItem('template_shares');
    return stored ? JSON.parse(stored) : [];
  }

  // Get share by ID
  getShare(shareId: string): SharedTemplate | null {
    const shares = this.getShares();
    return shares.find(s => s.id === shareId) || null;
  }

  // Revoke share
  revokeShare(shareId: string): boolean {
    const shares = this.getShares();
    const filtered = shares.filter(s => s.id !== shareId);
    localStorage.setItem('template_shares', JSON.stringify(filtered));
    return true;
  }
}

// Template analytics
export interface TemplateAnalytics {
  templateId: string;
  views: number;
  uses: number;
  favorites: number;
  rating: number;
  reviews: number;
  lastUsed: Date | null;
}

export class TemplateAnalyticsManager {
  private static instance: TemplateAnalyticsManager;

  static getInstance(): TemplateAnalyticsManager {
    if (!TemplateAnalyticsManager.instance) {
      TemplateAnalyticsManager.instance = new TemplateAnalyticsManager();
    }
    return TemplateAnalyticsManager.instance;
  }

  // Track template view
  trackView(templateId: string): void {
    const analytics = this.getAnalytics(templateId);
    analytics.views++;
    this.saveAnalytics(analytics);
  }

  // Track template use
  trackUse(templateId: string): void {
    const analytics = this.getAnalytics(templateId);
    analytics.uses++;
    analytics.lastUsed = new Date();
    this.saveAnalytics(analytics);
  }

  // Add to favorites
  addToFavorites(templateId: string): void {
    const analytics = this.getAnalytics(templateId);
    analytics.favorites++;
    this.saveAnalytics(analytics);
  }

  // Get analytics
  getAnalytics(templateId: string): TemplateAnalytics {
    const stored = localStorage.getItem(`template_analytics_${templateId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      templateId,
      views: 0,
      uses: 0,
      favorites: 0,
      rating: 0,
      reviews: 0,
      lastUsed: null,
    };
  }

  // Save analytics
  private saveAnalytics(analytics: TemplateAnalytics): void {
    localStorage.setItem(`template_analytics_${analytics.templateId}`, JSON.stringify(analytics));
  }

  // Get trending templates
  getTrendingTemplates(limit: number = 10): string[] {
    const allAnalytics: TemplateAnalytics[] = [];
    
    // Collect analytics for all templates
    [...ALL_TEMPLATES, ...templateManager.getCustomTemplates()].forEach(template => {
      allAnalytics.push(this.getAnalytics(template.id));
    });
    
    // Sort by recent usage and views
    return allAnalytics
      .sort((a, b) => {
        const aScore = a.uses * 2 + a.views + a.favorites * 3;
        const bScore = b.uses * 2 + b.views + b.favorites * 3;
        return bScore - aScore;
      })
      .slice(0, limit)
      .map(a => a.templateId);
  }
}

// Export singleton instances
export const templateManager = TemplateManager.getInstance();
export const templateVersionManager = TemplateVersionManager.getInstance();
export const templateShareManager = TemplateShareManager.getInstance();
export const templateAnalyticsManager = TemplateAnalyticsManager.getInstance();

