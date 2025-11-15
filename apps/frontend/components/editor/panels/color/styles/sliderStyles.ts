/**
 * Slider styles for color input components
 * Injected as a style tag in the document head
 */

export const SLIDER_STYLES = `
  .slider-thumb::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--thumb-color, #6F1414);
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.8);
    cursor: pointer;
    transition: all 0.15s ease-out;
  }
  
  .slider-thumb::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 3px rgba(255,255,255,1);
  }
  
  .slider-thumb::-webkit-slider-thumb:active {
    transform: scale(1.2);
    box-shadow: 0 6px 16px rgba(0,0,0,0.5), 0 0 0 4px rgba(255,255,255,1);
  }
  
  .slider-thumb::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--thumb-color, #6F1414);
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.8);
    cursor: pointer;
    transition: all 0.15s ease-out;
  }
  
  .slider-thumb::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 3px rgba(255,255,255,1);
  }
  
  .slider-thumb::-moz-range-track {
    background: transparent;
    border: none;
  }
  
  /* Specific channel colors for slider thumbs */
  .slider-thumb-red::-webkit-slider-thumb {
    background: #FF4444 !important;
  }
  .slider-thumb-green::-webkit-slider-thumb {
    background: #44FF44 !important;
  }
  .slider-thumb-blue::-webkit-slider-thumb {
    background: #4444FF !important;
  }
  .slider-thumb-cyan::-webkit-slider-thumb {
    background: #44FFFF !important;
  }
  .slider-thumb-magenta::-webkit-slider-thumb {
    background: #FF44FF !important;
  }
  .slider-thumb-yellow::-webkit-slider-thumb {
    background: #FFFF44 !important;
  }
  .slider-thumb-keyblack::-webkit-slider-thumb {
    background: #666666 !important;
  }
  
  .slider-thumb-red::-moz-range-thumb {
    background: #FF4444 !important;
  }
  .slider-thumb-green::-moz-range-thumb {
    background: #44FF44 !important;
  }
  .slider-thumb-blue::-moz-range-thumb {
    background: #4444FF !important;
  }
  .slider-thumb-cyan::-moz-range-thumb {
    background: #44FFFF !important;
  }
  .slider-thumb-magenta::-moz-range-thumb {
    background: #FF44FF !important;
  }
  .slider-thumb-yellow::-moz-range-thumb {
    background: #FFFF44 !important;
  }
  .slider-thumb-keyblack::-moz-range-thumb {
    background: #666666 !important;
  }
`;

/**
 * Hook to inject slider styles into the document head
 */
export function useSliderStyles() {
  if (typeof window === 'undefined') return;

  const styleId = 'color-panel-slider-styles';
  
  // Check if styles already exist
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = SLIDER_STYLES;
  document.head.appendChild(style);
}

