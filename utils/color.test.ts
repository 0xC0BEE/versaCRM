import { describe, it, expect } from 'vitest';
import { hexToRgb, rgbToHex } from './color';

describe('color utilities', () => {
  describe('hexToRgb', () => {
    it('should convert a valid hex color to RGB', () => {
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#3b82f6')).toEqual({ r: 59, g: 130, b: 246 });
    });

    it('should return null for an invalid hex color', () => {
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('#123')).toBeNull();
    });
  });

  describe('rgbToHex', () => {
    it('should convert an RGB color to a hex string', () => {
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
      // FIX: Corrected typo from rgbToHgb to rgbToHex.
      expect(rgbToHex(59, 130, 246)).toBe('#3b82f6');
    });
  });
});