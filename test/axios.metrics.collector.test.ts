import axios from "axios";
import { AxiosMetricsCollector } from "axios.metrics.collector";
import nock from "nock";
import { afterEach, describe, expect, it, vi } from "vitest";

const BASE_URL = "http://example.org";

describe("axios.metrics.collector", () => {
  const mockedClock = {
    now: vi.fn(),
  };
  const client = axios.create({
    baseURL: BASE_URL,
  });
  const mockedHandler = vi.fn();
  const collector = new AxiosMetricsCollector(client, mockedHandler);

  collector.setClock(mockedClock as any as DateConstructor);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should collect and call the handler on a successful response", async () => {
    const path = "/custom/path/to/test";

    nock(BASE_URL).get(path).once().reply(200);

    mockedClock.now.mockReturnValueOnce(500).mockReturnValueOnce(750);

    const request = client.get(path);

    await expect(request).resolves.not.toThrow();

    expect(mockedHandler).toHaveBeenCalledTimes(1);
    expect(mockedHandler).toHaveBeenCalledWith({
      baseUrl: BASE_URL,
      latency: 250,
      method: "get",
      status: 200,
      url: path,
    });
  });

  it("should collect and call the handler on a failed response", async () => {
    const path = "/custom/failed/path/to/test";

    nock(BASE_URL).post(path).once().reply(400);

    mockedClock.now.mockReturnValueOnce(300).mockReturnValueOnce(3301);

    const request = client.post(path);

    await expect(request).rejects.toThrow();

    expect(mockedHandler).toHaveBeenCalledTimes(1);
    expect(mockedHandler).toHaveBeenCalledWith({
      baseUrl: BASE_URL,
      latency: 3001,
      method: "post",
      status: 400,
      url: path,
    });
  });
});
