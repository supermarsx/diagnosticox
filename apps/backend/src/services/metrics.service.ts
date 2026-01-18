import { Registry, collectDefaultMetrics, Counter, Histogram, Summary } from 'prom-client';
import { Response } from 'express';

class MetricsService {
  public registry: Registry;
  
  // Custom metrics
  public httpRequestCounter: Counter;
  public httpRequestDuration: Histogram;
  public dbQueryDuration: Histogram;
  public authSuccessCounter: Counter;
  public authFailureCounter: Counter;

  constructor() {
    this.registry = new Registry();
    this.registry.setDefaultLabels({
      app: 'diagnosticox-backend'
    });

    collectDefaultMetrics({ register: this.registry });

    this.httpRequestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry]
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 10],
      registers: [this.registry]
    });

    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.registry]
    });

    this.authSuccessCounter = new Counter({
      name: 'auth_success_total',
      help: 'Total number of successful authentications',
      registers: [this.registry]
    });

    this.authFailureCounter = new Counter({
      name: 'auth_failure_total',
      help: 'Total number of failed authentications',
      labelNames: ['reason'],
      registers: [this.registry]
    });
  }

  async getMetrics() {
    return this.registry.metrics();
  }

  getContentType() {
    return this.registry.contentType;
  }
}

export const metricsService = new MetricsService();
