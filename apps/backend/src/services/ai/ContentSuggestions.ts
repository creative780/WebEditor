/**
 * Content Suggestions Service
 * Generate AI-powered text content
 */

export interface ContentSuggestion {
  id: string;
  type: 'headline' | 'subheadline' | 'body' | 'cta' | 'tagline';
  text: string;
  tone: 'professional' | 'friendly' | 'urgent' | 'informative' | 'persuasive';
  length: 'short' | 'medium' | 'long';
  industry: string;
}

export class ContentSuggestionsService {
  /**
   * Generate content suggestions
   */
  generateContent(
    type: string,
    industry: string,
    tone: string = 'professional'
  ): ContentSuggestion[] {
    const templates = this.getTemplates(industry, type);
    
    return templates.map((text, idx) => ({
      id: `content_${Date.now()}_${idx}`,
      type: type as any,
      text,
      tone: tone as any,
      length: this.determineLength(text),
      industry
    }));
  }

  /**
   * Optimize existing content
   */
  optimizeContent(text: string, goal: string): {
    original: string;
    optimized: string;
    improvements: string[];
  } {
    const improvements: string[] = [];
    let optimized = text;

    // Remove redundant words
    if (text.includes('very')) {
      optimized = optimized.replace(/very\s+/g, '');
      improvements.push('Removed redundant "very"');
    }

    // Strengthen action verbs
    const weakVerbs = ['make', 'do', 'get', 'have'];
    weakVerbs.forEach(verb => {
      if (text.toLowerCase().includes(verb)) {
        improvements.push(`Consider stronger alternative to "${verb}"`);
      }
    });

    // Check length
    if (text.length > 100 && goal === 'headline') {
      improvements.push('Headline could be shorter for impact');
    }

    return {
      original: text,
      optimized,
      improvements
    };
  }

  /**
   * Generate headlines
   */
  generateHeadlines(industry: string, count: number = 5): string[] {
    const templates = {
      tech: [
        'Innovation That Transforms',
        'Building Tomorrow, Today',
        'Technology That Empowers',
        'Your Digital Future Starts Here',
        'Smarter Solutions for Modern Challenges'
      ],
      medical: [
        'Your Health, Our Priority',
        'Compassionate Care, Advanced Medicine',
        'Healing Through Excellence',
        'Better Health, Better Life',
        'Where Caring Meets Cutting-Edge'
      ],
      restaurant: [
        'Experience Culinary Excellence',
        'Where Every Bite Tells a Story',
        'Flavor That Speaks for Itself',
        'A Taste of Something Special',
        'Crafted With Passion, Served With Pride'
      ],
      'real-estate': [
        'Your Dream Home Awaits',
        'Find Your Perfect Space',
        'Where Life Finds Its Place',
        'Home Is Just the Beginning',
        'Making Homeownership Possible'
      ]
    };

    const headlines = templates[industry] || templates.tech;
    return headlines.slice(0, count);
  }

  /**
   * Generate call-to-actions
   */
  generateCTAs(industry: string, urgency: 'low' | 'medium' | 'high' = 'medium'): string[] {
    const ctas = {
      low: [
        'Learn More',
        'Explore Options',
        'View Details',
        'Discover More',
        'See What\'s Possible'
      ],
      medium: [
        'Get Started Today',
        'Request a Quote',
        'Schedule a Consultation',
        'Contact Us Now',
        'Start Your Journey'
      ],
      high: [
        'Limited Time Offer',
        'Act Now',
        'Don\'t Miss Out',
        'Reserve Your Spot Today',
        'Claim Your Deal Now'
      ]
    };

    return ctas[urgency];
  }

  /**
   * Generate taglines
   */
  generateTaglines(industry: string): string[] {
    const taglines = {
      tech: [
        'Innovate. Elevate. Dominate.',
        'Technology that works for you',
        'Building a smarter tomorrow',
        'Where innovation meets excellence'
      ],
      medical: [
        'Caring for you, every step of the way',
        'Your health is our mission',
        'Excellence in healthcare',
        'Healing begins here'
      ],
      restaurant: [
        'Good food, good mood',
        'Where flavor meets passion',
        'Every meal is a masterpiece',
        'Bringing people together'
      ],
      'real-estate': [
        'Making dreams come home',
        'Your key to happiness',
        'Where memories are made',
        'Home sweet home'
      ]
    };

    return taglines[industry] || taglines.tech;
  }

  // Private helper methods
  private getTemplates(industry: string, type: string): string[] {
    switch (type) {
      case 'headline':
        return this.generateHeadlines(industry);
      case 'cta':
        return this.generateCTAs(industry);
      case 'tagline':
        return this.generateTaglines(industry);
      case 'body':
        return [
          'Discover the difference that quality makes.',
          'Join thousands of satisfied customers who trust us.',
          'Experience excellence in every interaction.',
          'Your success is our commitment.',
          'We\'re here to exceed your expectations.'
        ];
      default:
        return ['Professional content for your design'];
    }
  }

  private determineLength(text: string): 'short' | 'medium' | 'long' {
    if (text.length < 30) return 'short';
    if (text.length < 80) return 'medium';
    return 'long';
  }
}

export const contentSuggestionsService = new ContentSuggestionsService();

