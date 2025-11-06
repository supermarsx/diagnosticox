/// <reference types="vite/client" />

// Vite environment types
interface ImportMetaEnv {
  readonly VITE_WHO_ICD_CLIENT_ID: string;
  readonly VITE_WHO_ICD_CLIENT_SECRET: string;
  readonly VITE_INFERMEDICA_API_KEY?: string;
  readonly VITE_USAGE_MODE: 'clinical_setting' | 'clinical_study' | 'student' | 'full_hospital' | 'self_exploration';
  readonly VITE_DEFAULT_LANGUAGE: string;
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Service worker types
interface ServiceWorkerRegistration {
  readonly active: ServiceWorker | null;
  readonly installing: ServiceWorker | null;
  readonly waiting: ServiceWorker | null;
  readonly scope: string;
  addEventListener(type: 'updatefound', listener: (event: Event) => void): void;
  addEventListener(type: 'controllerchange', listener: (event: Event) => void): void;
  postMessage(message: any): void;
  update(): Promise<void>;
  unregister(): Promise<boolean>;
}

// Global navigator service worker
interface Navigator {
  serviceWorker: ServiceWorkerContainer | null;
}

interface ServiceWorkerContainer {
  readonly ready: Promise<ServiceWorkerRegistration>;
  addEventListener(type: 'controllerchange', listener: (event: Event) => void): void;
  addEventListener(type: 'message', listener: (event: MessageEvent) => void): void;
  addEventListener(type: 'install', listener: (event: ExtendableEvent) => void): void;
  addEventListener(type: 'activate', listener: (event: ExtendableEvent) => void): void;
  register(scriptUrl: string, options?: RegistrationOptions): Promise<ServiceWorkerRegistration>;
}

interface RegistrationOptions {
  readonly scope?: string;
  readonly type?: 'classic' | 'module';
  readonly updateViaCache?: 'none' | 'imports' | 'all';
  readonly credentials?: 'include' | 'same-origin';
  readonly cacheName?: string;
}

interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<any>): void;
}

// Add global type for offline detection
interface WindowEventMap {
  'online': Event;
  'offline': Event;
  'beforeinstallprompt': Event;
  'appinstalled': Event;
}
