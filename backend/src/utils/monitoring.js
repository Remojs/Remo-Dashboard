const axios = require('axios');

const TIMEOUT_MS = 10000; // 10 s hard timeout per request

/**
 * Determines monitor status based on response time.
 * @param {number|null} ms - response time in milliseconds
 * @returns {'online'|'slow'|'offline'}
 */
const resolveStatus = (ms) => {
  if (ms === null || ms === undefined) return 'offline';
  if (ms < 500) return 'online';
  if (ms <= 1500) return 'slow';
  return 'offline';
};

/**
 * Pings a URL and returns timing data.
 * @param {string} url
 * @returns {{ status: string, responseTime: number|null, ttfb: number|null }}
 */
const pingUrl = async (url) => {
  const start = Date.now();
  let ttfbMs = null;

  try {
    const response = await axios.get(url, {
      timeout: TIMEOUT_MS,
      validateStatus: () => true, // accept any HTTP status
      onDownloadProgress: (progressEvent) => {
        // Capture TTFB on first byte received
        if (ttfbMs === null && progressEvent.loaded > 0) {
          ttfbMs = Date.now() - start;
        }
      },
    });

    const responseTime = Date.now() - start;
    if (ttfbMs === null) ttfbMs = responseTime;

    // Treat 5xx as offline
    if (response.status >= 500) {
      return { status: 'offline', responseTime, ttfb: ttfbMs };
    }

    return {
      status: resolveStatus(responseTime),
      responseTime,
      ttfb: ttfbMs,
    };
  } catch {
    const elapsed = Date.now() - start;
    return {
      status: resolveStatus(elapsed > TIMEOUT_MS ? null : elapsed),
      responseTime: elapsed >= TIMEOUT_MS ? null : elapsed,
      ttfb: null,
    };
  }
};

/**
 * Checks both the frontend and backend of a website.
 * @param {string} domain - base domain, e.g. https://example.com
 * @returns {{ frontendStatus, backendStatus, responseTime, ttfb }}
 */
const checkWebsite = async (domain) => {
  const cleanDomain = domain.replace(/\/$/, '');

  const [frontend, backend] = await Promise.all([
    pingUrl(cleanDomain),
    pingUrl(`${cleanDomain}/api/health`),
  ]);

  return {
    frontendStatus: frontend.status,
    backendStatus: backend.status,
    responseTime: frontend.responseTime,
    ttfb: frontend.ttfb,
  };
};

module.exports = { checkWebsite, pingUrl, resolveStatus };
