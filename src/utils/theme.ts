import { MantineThemeOverride } from '@mantine/core';
import { ChartTheme } from '@/types/financial';

export const institutionalTheme: MantineThemeOverride = {
  colorScheme: 'light',
  primaryColor: 'blue',
  colors: {
    blue: ['#E7F5FF', '#D0EBFF', '#A5D8FF', '#74C0FC', '#339AF0', '#228BE6', '#1C7ED6', '#1971C2', '#1864AB', '#0B4D8C'],
    financial: ['#E8F5E8', '#D1F2D1', '#A8E6A8', '#7DD87D', '#40C057', '#37B24D', '#2F9E44', '#2B8A3E', '#237332', '#1B5E20'] as any,
    risk: ['#FFF3E0', '#FFE0B2', '#FFCC82', '#FFB74D', '#FF9800', '#FB8C00', '#F57C00', '#EF6C00', '#E65100', '#BF360C'] as any,
    loss: ['#FFEBEE', '#FFCDD2', '#EF9A9A', '#E57373', '#E03131', '#D32F2F', '#C62828', '#B71C1C', '#AD1457', '#880E4F'] as any,
  },
  fontFamily: 'Inter, system-ui, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, Monaco, Consolas, monospace',
  headings: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '600',
  },
  components: {
    Card: {
      styles: {
        root: {
          border: '1px solid #E9ECEF',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    Button: {
      styles: {
        root: {
          fontWeight: 500,
        },
      },
    },
    Badge: {
      styles: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radius: {
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
};

export const chartTheme: ChartTheme = {
  colors: {
    primary: '#228BE6',
    profit: '#40C057',
    loss: '#E03131',
    warning: '#FD7E14',
    stable: '#868E96',
    background: '#FFFFFF',
    text: '#212529',
    grid: '#E9ECEF',
  },
  fonts: {
    primary: 'Inter, system-ui, sans-serif',
    monospace: 'JetBrains Mono, Monaco, Consolas, monospace',
  },
};

// Recharts color palettes for different chart types
export const bondRatingColors = {
  'AAA': '#40C057',
  'AA+': '#51CF66',
  'AA': '#69DB7C',
  'AA-': '#8CE99A',
  'A+': '#A9E34B',
  'A': '#C0EB75',
  'A-': '#D8F5A2',
  'BBB+': '#FFF3BF',
  'BBB': '#FFEC99',
  'BBB-': '#FFE066',
  'BB+': '#FFD43B',
  'BB': '#FCC419',
  'BB-': '#FAB005',
};

export const sectorColors = {
  'Government': '#228BE6',
  'Corporate': '#40C057',
  'Financial': '#FD7E14',
  'Utilities': '#7C2D12',
  'Healthcare': '#BE4BDB',
  'Technology': '#9775FA',
  'Energy': '#F76707',
  'Real Estate': '#20C997',
  'Consumer': '#FF6B6B',
  'Industrial': '#51CF66',
  'Municipal': '#1098AD',
  'Sovereign': '#495057',
};

export const riskLevelColors = {
  'very-low': '#40C057',
  'low': '#69DB7C',
  'medium': '#FCC419',
  'high': '#FF8787',
  'very-high': '#E03131',
};

// Utility function to get color by risk level
export const getRiskColor = (riskLevel: number): string => {
  if (riskLevel <= 20) return riskLevelColors['very-low'];
  if (riskLevel <= 40) return riskLevelColors['low'];
  if (riskLevel <= 60) return riskLevelColors['medium'];
  if (riskLevel <= 80) return riskLevelColors['high'];
  return riskLevelColors['very-high'];
};

// Utility function to get rating color
export const getRatingColor = (rating: string): string => {
  return bondRatingColors[rating as keyof typeof bondRatingColors] || '#868E96';
};

// Utility function to get sector color
export const getSectorColor = (sector: string): string => {
  return sectorColors[sector as keyof typeof sectorColors] || '#868E96';
};

// Chart responsive configuration
export const getResponsiveChartConfig = (containerWidth: number) => ({
  width: containerWidth,
  height: containerWidth < 768 ? 300 : containerWidth < 1200 ? 400 : 500,
  margin: containerWidth < 768
    ? { top: 20, right: 20, bottom: 60, left: 60 }
    : { top: 20, right: 30, bottom: 80, left: 80 },
});