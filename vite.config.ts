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
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        drop_comments: true, // Remove all comments
      },
    } : undefined,
    sourcemap: isProd ? false : true, // Only generate source maps in dev
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'radix-vendor': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip'
          ],
          'charts-vendor': ['echarts', 'echarts-for-react', 'recharts'],
          'icons-vendor': ['lucide-react'],
          'forms-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'clinical-services': [
            './src/services/icdService',
            './src/services/dsm5Service',
            './src/services/symptomService',
            './src/services/vindicatemService',
            './src/services/fhirService'
          ],
          'research-services': [
            './src/services/pubmedService',
            './src/services/clinicalTrialsService',
            './src/services/drugBankService'
          ],
          'ai-services': ['./src/services/aiProviderService'],
          'cache-services': [
            './src/services/cacheService',
            './src/services/crawlerService',
            './src/services/cacheIntegration'
          ],
          'clinical-pages': [
            './src/pages/ICDLookupPage',
            './src/pages/DSM5AssessmentsPage',
            './src/pages/SymptomCheckerPage',
            './src/pages/VindicatemDiagnosisPage',
            './src/pages/FHIRInteroperabilityPage'
          ],
          'analytics-pages': [
            './src/pages/AnalyticsDashboard',
            './src/pages/PatientOutcomesTracker',
            './src/pages/TreatmentEfficacyCenter',
            './src/pages/PopulationHealthMonitor',
            './src/pages/CustomDashboardBuilder',
            './src/pages/ReportingSystem'
          ],
          'security-pages': [
            './src/pages/SecurityCenterHub',
            './src/pages/MultiFactorAuth',
            './src/pages/RolePermissionsManager',
            './src/pages/OrganizationManagement',
            './src/pages/SecurityAuditLogs',
            './src/pages/EncryptionManagement',
            './src/pages/PrivacyControls',
            './src/pages/AdminPanel'
          ],
          'pwa-pages': [
            './src/pages/NotificationsCenter',
            './src/pages/RealtimeMonitoringPage',
            './src/pages/VoiceAssistantPage'
          ],
          'visualization-pages': [
            './src/pages/VisualizationsHub',
            './src/pages/MedicalTimeline',
            './src/pages/SymptomHeatmaps',
            './src/pages/AnatomicalModels',
            './src/pages/MedicalImaging',
            './src/pages/CameraIntegration'
          ],
          'settings-pages': [
            './src/pages/FeatureManagementPage',
            './src/pages/AIProviderSettings',
            './src/pages/AdaptiveManagementPage',
            './src/pages/CacheMetricsDashboard'
          ]
        },
        // Asset naming
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        // Optimize asset file names
        // Remove ? query string from imports
        format: 'es',
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // CSS Code splitting
    cssCodeSplit: true,
    // Modulepreload
    modulePreload: true,
  },
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true,
    // Proxy for development
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 3000,
    host: true,
  },
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'clsx',
      'tailwind-merge',
    ],
    // Exclude very large packages from pre-bundling
    exclude: ['echarts', 'echarts-for-react'],
  },
  // CSS optimizations
  css: {
    devSourcemap: true,
    postcss: './postcss.config.js',
  },
});