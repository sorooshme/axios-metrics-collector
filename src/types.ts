import type { InternalAxiosRequestConfig } from "axios";

export interface TimedAxiosRequestConfig<D>
  extends InternalAxiosRequestConfig<D> {
  startedAtMs: number;
}

export interface CollectedMetrics {
  method?: string;
  url?: string;
  baseUrl?: string;
  status?: number;
  latency?: number;
  labels?: MetricLabels;
}

export type CollectedMetricsHandler = (metrics: CollectedMetrics) => void;

export type MetricLabels = Record<string, unknown>;

declare module "axios" {
  interface AxiosRequestConfig {
    metricLabels?: MetricLabels;
  }
}
