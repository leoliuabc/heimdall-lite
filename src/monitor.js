// src/monitor.js
export const checkService = async (service) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), service.timeout || 5000);
  
      const res = await fetch(service.url, { signal: controller.signal });
      clearTimeout(timeoutId);
  
      const isUp = res.status === service.expectedStatus;
      return {
        name: service.name,
        url: service.url,
        status: res.status,
        ok: isUp,
        timestamp: new Date().toISOString(),
      };
    } catch (e) {
      return {
        name: service.name,
        url: service.url,
        status: 0,
        ok: false,
        error: e.name || "FetchError",
        timestamp: new Date().toISOString(),
      };
    }
  };