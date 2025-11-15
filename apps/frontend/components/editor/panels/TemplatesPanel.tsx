'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Eye,
  Clock,
  Users,
  TrendingUp,
  Palette,
  Type,
  Layout,
  Save,
  Plus
} from 'lucide-react';
import { templateManager, Template, TemplateCategory, INDUSTRIES, TEMPLATE_CATEGORIES, templateAnalyticsManager } from '../../../lib/templates';
import { useEditorStore } from '../../../state/useEditorStore';

export function TemplatesPanel() {
  const { objects, document } = useEditorStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'newest' | 'name'>('popularity');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateIndustry, setTemplateIndustry] = useState('restaurant');
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>('business-cards');

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, []);

  // Filter templates
  useEffect(() => {
    let filtered = [...templates];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by industry
    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(template => template.industry === selectedIndustry);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  }, [templates, searchQuery, selectedIndustry, selectedCategory, sortBy]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      // Load all templates including custom ones
      await new Promise(resolve => setTimeout(resolve, 300));
      const allTemplates = templateManager.getAllTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    const template = templateManager.createCustomTemplate(
      templateName,
      templateDescription,
      templateCategory,
      templateIndustry,
      objects,
      {
        width: document.width,
        height: document.height,
        unit: document.unit as 'px' | 'mm' | 'in',
        dpi: document.dpi,
        bleed: document.bleed,
        colorMode: 'CMYK',
        orientation: document.width > document.height ? 'landscape' : 'portrait',
      }
    );

    // Track analytics
    templateAnalyticsManager.trackUse(template.id);

    // Reload templates
    loadTemplates();

    // Close dialog
    setShowCreateDialog(false);
    setTemplateName('');
    setTemplateDescription('');
  };

  const handleTemplateSelect = (template: Template) => {
    // Apply template to document
    console.log('Applying template:', template);
    // This would integrate with the editor store
  };

  const getIndustryIcon = (industry: string) => {
    const industryData = INDUSTRIES.find(i => i.id === industry);
    return industryData?.icon || '📄';
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = TEMPLATE_CATEGORIES.find(c => c.id === category);
    return categoryData?.icon || '📄';
  };

  const getPopularityStars = (popularity: number) => {
    const stars = Math.round(popularity / 20); // Convert to 1-5 stars
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">TEMPLATES</h3>
          <div className="flex gap-1">
            <button className="btn btn-ghost text-xs">
              <TrendingUp className="w-3 h-3" />
            </button>
            <button className="btn btn-ghost text-xs">
              <Clock className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="panel-content">
        {/* Save as Template Button */}
        <button
          onClick={() => setShowCreateDialog(true)}
          disabled={objects.length === 0}
          className="w-full mb-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Save className="w-4 h-4" />
          Save as Template
        </button>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:border-[#6F1414]"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-4">
          {/* Industry Filter */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Industry</label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#6F1414]"
            >
              <option value="all">All Industries</option>
              {INDUSTRIES.map(industry => (
                <option key={industry.id} value={industry.id}>
                  {industry.icon} {industry.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory | 'all')}
              className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#6F1414]"
            >
              <option value="all">All Categories</option>
              {TEMPLATE_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'popularity' | 'newest' | 'name')}
              className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#6F1414]"
            >
              <option value="popularity">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6F1414]"></div>
            <span className="ml-2 text-xs text-gray-600">Loading...</span>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-3 hover:border-[#6F1414] hover:shadow-sm transition-all cursor-pointer"
                onClick={() => handleTemplateSelect(template)}
              >
                {/* Template Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold text-gray-900 mb-1">
                      {template.name}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {getPopularityStars(template.popularity)}
                  </div>
                </div>

                {/* Template Info */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    {getIndustryIcon(template.industry)}
                    {INDUSTRIES.find(i => i.id === template.industry)?.name}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    {getCategoryIcon(template.category)}
                    {TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.name}
                  </span>
                </div>

                {/* Template Specs */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>{template.specs.width}" × {template.specs.height}"</span>
                  <span>{template.specs.dpi} DPI</span>
                  <span className="capitalize">{template.specs.colorMode}</span>
                </div>

                {/* Template Actions */}
                <div className="flex items-center gap-1">
                  <button className="btn btn-ghost text-xs flex-1">
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </button>
                  <button className="btn btn-primary text-xs flex-1">
                    <Download className="w-3 h-3 mr-1" />
                    Use Template
                  </button>
                </div>

                {/* Template Tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      +{template.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {filteredTemplates.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <div className="text-xs text-gray-500 mb-2">No templates found</div>
                <div className="text-xs text-gray-400">
                  Try adjusting your search or filters
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {templates.length} Templates
            </div>
            <div className="flex items-center gap-1">
              <Palette className="w-3 h-3" />
              {INDUSTRIES.length} Industries
            </div>
          </div>
        </div>
      </div>

      {/* Create Template Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save as Template</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe your template"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value as TemplateCategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {TEMPLATE_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  value={templateIndustry}
                  onChange={(e) => setTemplateIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {INDUSTRIES.map(industry => (
                    <option key={industry.id} value={industry.id}>
                      {industry.icon} {industry.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTemplate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}