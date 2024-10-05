import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import type {
  CollectedMetrics,
  CollectedMetricsHandler,
  TimedAxiosRequestConfig,
} from "types";

/**
 * Creates interceptors for an AxiosInstance and collects metrics on each response
 */
export class AxiosMetricsCollector {
  private clock = Date;

  /**
   * Set the clock to replace the default `Date` object.
   */
  setClock(newClock: DateConstructor) {
    this.clock = newClock;
  }

  constructor(
    client: AxiosInstance,
    private collectedMetricsHandler: CollectedMetricsHandler
  ) {
    client.interceptors.request.use(this.requestInterceptor);

    client.interceptors.response.use(
      this.successfulResponseInterceptor,
      this.failedResponseInterceptor
    );
  }

  private requestInterceptor = (
    request: InternalAxiosRequestConfig<unknown>
  ): TimedAxiosRequestConfig<unknown> => {
    const timedRequestConfig = request as TimedAxiosRequestConfig<unknown>;

    timedRequestConfig.startedAtMs = this.clock.now();

    return timedRequestConfig;
  };

  private collect(response: AxiosResponse<unknown, unknown>): void {
    const timedRequestConfig =
      response.config as TimedAxiosRequestConfig<unknown>;
    const latencyMs = this.clock.now() - timedRequestConfig.startedAtMs;

    const metrics: CollectedMetrics = {
      method: timedRequestConfig.method,
      url: timedRequestConfig.url,
      baseUrl: timedRequestConfig.baseURL,
      status: response.status,
      latency: latencyMs,
    };

    this.collectedMetricsHandler(metrics);
  }

  private successfulResponseInterceptor = (
    response: AxiosResponse<unknown, unknown>
  ): AxiosResponse<unknown, unknown> => {
    this.collect(response);

    return response;
  };

  private failedResponseInterceptor = (error: AxiosError) => {
    if ("response" in error && error.response) {
      this.collect(error.response);
    }

    return Promise.reject(error);
  };
}
