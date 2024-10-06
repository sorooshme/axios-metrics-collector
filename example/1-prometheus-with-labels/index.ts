import axios from "axios";
import { Histogram } from "prom-client";
import { AxiosMetricsCollector } from "../../src";

const histogram = new Histogram({
  name: "request_histogram",
  help: "Request Histogram",
  labelNames: ["action", "environment"],
});

async function doExample() {
  const client = axios.create();

  new AxiosMetricsCollector(client, (metrics) => {
    // No guarantee that the axios.get caller has passed the right labels
    // So label values are `unknown`
    const histogramLabels = {
      action: metrics.labels?.["action"] as string,
      environment: metrics.labels?.["environment"] as string,
    };

    histogram.observe(
      histogramLabels,
      metrics.latency ?? Number.POSITIVE_INFINITY
    );
  });

  await client.get("https://example.org", {
    metricLabels: {
      action: "create-payment",
      environment: "production",
    },
  });

  const values = await histogram.get();

  return values;
}

doExample().then(console.log).catch(console.error);
