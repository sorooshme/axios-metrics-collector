# Axios Metrics Collector

TypeScript library to collect metrics from [axios](https://github.com/axios/axios).

The collector is intentionally kept simple to allow a wide range of use cases, if a use case becomes common enough, it may be introduced as a built-in feature.

## Usage

On each response, the provided collector `handler` will be called, which can be used to store the metric somewhere.

```ts
import { AxiosMetricsCollector } from "@sorooshme/axios-metrics-collector";
import axios from "axios";

const client = axios.create();

new AxiosMetricsCollector(client, (metrics) => {
  console.log("my metrics", metrics);
});

await client.get("https://example.org");
```

## Collected Metrics

For each response, the following values are collected.

```ts
interface CollectedMetrics {
  method?: string;
  url?: string;
  baseUrl?: string;
  status?: number;
  latency?: number; // in miliseconds
  labels?: MetricLabels; // custom labels passed by you
}
```

### Use Case - Prometheus with labels

The collector `handler` can be used to store the metrics in Prometheus.

```ts
const histogram = new Histogram();

new AxiosMetricsCollector(client, (metrics) => {
  histogram.observe(metrics.labels, metrics.latency);
});

await client.get("https://example.org", {
  metricLabels: {
    customLabel: "custom-value",
  },
});
```

A full example can be found [here](/example/1-prometheus-with-labels/index.ts).

## Feedback

Feedback is possible via Github issues.
