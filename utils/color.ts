/**
 * Converts a hex color string to an RGB object.
 * @param hex The hex color string (e.g., "#RRGGBB").
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

/**
 * Converts an RGB color object to a hex string.
 * @param r Red value (0-255).
 * @param g Green value (0-255).
 * @param b Blue value (0-255).
 */
export function rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Lightens or darkens a hex color by a given percentage.
 * @param hex The hex color string.
 * @param percent A value from -100 (black) to 100 (white).
 * @returns The new hex color string.
 */
export function shadeColor(hex: string, percent: number): string {
    let { r, g, b } = hexToRgb(hex) || { r: 0, g: 0, b: 0 };

    const amount = Math.floor((percent / 100) * 255);

    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    return rgbToHex(r, g, b);
}