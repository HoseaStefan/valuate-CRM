import { Platform } from 'react-native';

export const ValuateColors = {
  // Warna Utama
  primary: '#000000', // Hitam Pekat (Tombol/Aksen utama)
  secondary: '#F3F4F6', // Abu sangat muda (Tombol sekunder/Background icon)
  
  // Backgrounds
  background: '#FFFFFF',        
  navBackground: '#FFFFFF',    
  contentBackground: '#FFFFFF', 
  secondaryBackground: '#F9FAFB', 
  
  // Cards & Surfaces
  cardBackground: '#FFFFFF',
  
  // Status Colors (Desaturated agar tetap clean)
  success: '#10b981', // Hijau 
  warning: '#f59e0b', // Kuning/Oranye
  error: '#ef4444',   // Merah
  
  // Text Colors
  text: {
    primary: '#09090b',    // Hampir hitam (Teks utama)
    secondary: '#71717a',  // Abu-abu sedang (Subtitle)
    light: '#a1a1aa',      // Abu-abu muda (Placeholder)
    inverse: '#FFFFFF',    // Putih (Teks di atas background hitam)
  },
  
  // Borders
  border: '#E4E4E7', // Abu-abu muda untuk garis pemisah
  
  // Shadows (Soft shadows)
  shadow: {
    light: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 4,
    }
  }
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});