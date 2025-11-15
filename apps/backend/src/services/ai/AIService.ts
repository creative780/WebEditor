/**
 * AI Service - OpenAI Integration & Caching
 * Provides AI-powered design suggestions and improvements
 */

import { createClient } from 'redis';

export interface AIRequest {
  type: 'layout' | 'color' | 'content' | 'improve' | 'analyze';
  context: {
    designId?: string;
    objects?: any[];
    industry?: string;
    style?: string;
    requirements?: string[];
  };
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  };
}

export interface AISuggestion {
  id: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  implementation?: any;
  reasoning: string;
}

export interface AIResponse {
  success: boolean;
  suggestions: AISuggestion[];
  analysis?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cached: boolean;
  error?: string;
}

export class AIService {
  private redis: any;
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1';
  private cacheEnabled: boolean = true;
  private cacheTTL: number = 3600; // 1 hour

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.redis.connect().catch(console.error);
  }

  /**
   * Generate AI suggestions based on request
   */
  async generateSuggestions(request: AIRequest): Promise<AIResponse> {
    try {
      // Check cache first
      if (this.cacheEnabled) {
        const cached = await this.getFromCache(request);
        if (cached) {
          return { ...cached, cached: true };
        }
      }

      // Generate cache key
      const cacheKey = this.generateCacheKey(request);

      // Call OpenAI API
      const response = await this.callOpenAI(request);

      // Cache the response
      if (this.cacheEnabled && response.success) {
        await this.saveToCache(cacheKey, response);
      }

      return { ...response, cached: false };
    } catch (error) {
      console.error('AI Service error:', error);
      return {
        success: false,
        suggestions: [],
        cached: false,
        error: error.message
      };
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(request: AIRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      // Return mock suggestions when API key is not configured
      return this.getMockSuggestions(request);
    }

    try {
      const prompt = this.buildPrompt(request);
      const model = request.options?.model || 'gpt-4';
      const temperature = request.options?.temperature || 0.7;
      const maxTokens = request.options?.maxTokens || 1000;

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert graphic designer providing actionable design suggestions.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature,
          max_tokens: maxTokens
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const suggestions = this.parseSuggestions(data.choices[0].message.content, request.type);

      return {
        success: true,
        suggestions,
        analysis: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        },
        cached: false
      };
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      // Fallback to mock suggestions
      return this.getMockSuggestions(request);
    }
  }

  /**
   * Build prompt for OpenAI
   */
  private buildPrompt(request: AIRequest): string {
    const { type, context } = request;

    switch (type) {
      case 'layout':
        return `Analyze this design layout and provide specific improvement suggestions:
Objects: ${JSON.stringify(context.objects)}
Industry: ${context.industry || 'general'}
Style: ${context.style || 'modern'}

Provide 3-5 actionable layout improvements with confidence scores.`;

      case 'color':
        return `Suggest color palette improvements for this design:
Current colors: ${this.extractColors(context.objects || [])}
Industry: ${context.industry || 'general'}
Style: ${context.style || 'modern'}

Provide color harmony suggestions with hex codes.`;

      case 'content':
        return `Generate compelling text content for this design:
Type: ${context.requirements?.join(', ') || 'headline, body'}
Industry: ${context.industry || 'general'}
Tone: professional and engaging

Provide 3-5 content options.`;

      case 'improve':
        return `Analyze this design and provide comprehensive improvement suggestions:
Objects: ${JSON.stringify(context.objects)}
Industry: ${context.industry || 'general'}

Provide specific, actionable suggestions across layout, typography, colors, and overall design.`;

      case 'analyze':
        return `Provide a detailed design analysis:
Objects: ${JSON.stringify(context.objects)}
Requirements: ${context.requirements?.join(', ') || 'none'}

Analyze strengths, weaknesses, and opportunities for improvement.`;

      default:
        return 'Analyze this design and provide suggestions.';
    }
  }

  /**
   * Extract colors from objects
   */
  private extractColors(objects: any[]): string {
    const colors = new Set<string>();
    objects.forEach(obj => {
      if (obj.fill?.color) colors.add(obj.fill.color);
      if (obj.stroke?.color) colors.add(obj.stroke.color);
      if (obj.color) colors.add(obj.color);
    });
    return Array.from(colors).join(', ') || 'none';
  }

  /**
   * Parse AI response into suggestions
   */
  private parseSuggestions(content: string, type: string): AISuggestion[] {
    // This is a simplified parser
    // In production, use more sophisticated parsing
    const suggestions: AISuggestion[] = [];
    const lines = content.split('\n');
    
    let currentSuggestion: Partial<AISuggestion> = {};
    
    lines.forEach((line, idx) => {
      // Look for numbered suggestions
      const match = line.match(/^(\d+)\.\s*(.+)/);
      if (match) {
        if (currentSuggestion.title) {
          suggestions.push(currentSuggestion as AISuggestion);
        }
        currentSuggestion = {
          id: `ai_suggestion_${Date.now()}_${idx}`,
          type,
          title: match[2],
          description: '',
          confidence: 85,
          reasoning: ''
        };
      } else if (line.trim() && currentSuggestion.title) {
        currentSuggestion.description += line + ' ';
      }
    });

    if (currentSuggestion.title) {
      suggestions.push(currentSuggestion as AISuggestion);
    }

    return suggestions.length > 0 ? suggestions : this.getMockSuggestions({ type, context: {} } as AIRequest).suggestions;
  }

  /**
   * Get mock suggestions (fallback)
   */
  private getMockSuggestions(request: AIRequest): AIResponse {
    const { type } = request;
    const suggestions: AISuggestion[] = [];

    switch (type) {
      case 'layout':
        suggestions.push({
          id: 'layout_1',
          type: 'layout',
          title: 'Improve Visual Hierarchy',
          description: 'Create stronger visual hierarchy by varying font sizes more dramatically',
          confidence: 85,
          reasoning: 'Clear hierarchy guides the viewer\'s eye and improves comprehension'
        });
        suggestions.push({
          id: 'layout_2',
          type: 'layout',
          title: 'Apply Golden Ratio',
          description: 'Adjust element proportions to follow the golden ratio (1.618:1)',
          confidence: 80,
          reasoning: 'Golden ratio creates naturally pleasing proportions'
        });
        break;

      case 'color':
        suggestions.push({
          id: 'color_1',
          type: 'color',
          title: 'Enhance Color Contrast',
          description: 'Increase contrast between text and background for better readability',
          confidence: 90,
          implementation: { primaryColor: '#2c3e50', accentColor: '#3498db' },
          reasoning: 'Higher contrast improves accessibility and readability'
        });
        break;

      case 'content':
        suggestions.push({
          id: 'content_1',
          type: 'content',
          title: 'Professional Headline',
          description: 'Excellence in Every Detail',
          confidence: 85,
          reasoning: 'Short, impactful headline that conveys quality'
        });
        suggestions.push({
          id: 'content_2',
          type: 'content',
          title: 'Engaging Call-to-Action',
          description: 'Start Your Journey Today',
          confidence: 82,
          reasoning: 'Action-oriented language that creates urgency'
        });
        break;

      default:
        suggestions.push({
          id: 'general_1',
          type: 'general',
          title: 'Simplify Design',
          description: 'Remove unnecessary elements to create more breathing room',
          confidence: 80,
          reasoning: 'Minimalist designs are more effective and modern'
        });
    }

    return {
      success: true,
      suggestions,
      cached: false
    };
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(request: AIRequest): string {
    const key = JSON.stringify({
      type: request.type,
      context: request.context,
      options: request.options
    });
    return `ai:${Buffer.from(key).toString('base64')}`;
  }

  /**
   * Get from cache
   */
  private async getFromCache(request: AIRequest): Promise<AIResponse | null> {
    try {
      const key = this.generateCacheKey(request);
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Save to cache
   */
  private async saveToCache(key: string, response: AIResponse): Promise<void> {
    try {
      await this.redis.setEx(key, this.cacheTTL, JSON.stringify(response));
    } catch (error) {
      console.error('Cache save error:', error);
    }
  }

  /**
   * Clear cache
   */
  async clearCache(pattern: string = 'ai:*'): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

// Export singleton instance
export const aiService = new AIService();

