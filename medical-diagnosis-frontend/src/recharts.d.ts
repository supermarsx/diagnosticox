/**
 * Recharts React 18 Type Compatibility
 * 
 * Recharts v2.x has known type issues with React 18.3+
 * This file provides type declarations to suppress these errors.
 */

declare module 'recharts' {
  export * from 'recharts/types';
  
  // Allow any props for problematic components
  export const XAxis: any;
  export const YAxis: any;
  export const Tooltip: any;
  export const Legend: any;
  export const Line: any;
  export const Bar: any;
  export const Pie: any;
  export const Radar: any;
  export const PolarAngleAxis: any;
  export const PolarRadiusAxis: any;
}
