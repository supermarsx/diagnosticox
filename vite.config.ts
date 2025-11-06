import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import sourceIdentifierPlugin from 'vite-plugin-source-identifier'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'

const isProd = process.env.BUILD_MODE === 'prod'
const isAnalyze = process.env.BUILD_MODE === 'analyze'

export default defineConfig({
  plugins: [
    react(), 
    sourceIdentifierPlugin({
      enabled: !isProd,
      attributePrefix: 'data-matrix',
      includeProps: true,
    }),
    // Gzip compression for production
    isProd && compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files > 10KB
    }),
    // Brotli compression for production
    isProd && compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
    }),
    // Bundle analyzer
    isAnalyze && visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Production optimizations
    target: 'es2015',
    minify: isProd ? 'terser' : false,
    terserOptions: isProd ? {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      format: {
        comments: false, // Remove comments
      },
    } : undefined,
    
    // Code splitting configuration
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal loading
        manualChunks: (id) => {
          // Vendor chunk for node_modules
          if (id.includes('node_modules')) {
            // Large libraries get their own chunks
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-vendor';
            }
            if (id.includes('recharts')) {
              return 'charts-vendor';
            }
            // All other vendor code
            return 'vendor';
          }
          
          // Feature-based chunks for app code
          if (id.includes('/services/')) {
            if (id.includes('icdService') || id.includes('dsm5Service') || id.includes('symptomService')) {
              return 'clinical-services';
            }
            if (id.includes('pubmedService') || id.includes('clinicalTrialsService') || id.includes('drugBankService')) {
              return 'research-services';
            }
            if (id.includes('aiProviderService')) {
              return 'ai-services';
            }
            return 'services';
          }
          
          if (id.includes('/pages/')) {
            if (id.includes('Security') || id.includes('Admin') || id.includes('Privacy')) {
              return 'security-pages';
            }
            if (id.includes('Analytics') || id.includes('Reporting') || id.includes('Dashboard')) {
              return 'analytics-pages';
            }
            if (id.includes('ICD') || id.includes('DSM5') || id.includes('Symptom')) {
              return 'clinical-pages';
            }
            return 'pages';
          }
        },
        
        // Naming pattern for chunks
        chunkFileNames: isProd 
          ? 'assets/[name]-[hash].js' 
          : 'assets/[name].js',
        entryFileNames: isProd 
          ? 'assets/[name]-[hash].js' 
          : 'assets/[name].js',
        assetFileNames: isProd 
          ? 'assets/[name]-[hash].[ext]' 
          : 'assets/[name].[ext]',
      },
    },
    
    // Build output settings
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: !isProd, // Source maps only in development
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000, // 1000 KB
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Report compressed size
    reportCompressedSize: isProd,
  },
  
  // Server configuration
  server: {
    port: 5173,
    strictPort: false,
    open: false,
    cors: true,
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
    open: false,
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'date-fns',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
})