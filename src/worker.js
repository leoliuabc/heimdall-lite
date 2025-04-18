// src/worker.js
import { services } from "./services";
import { checkService } from "./monitor";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/status") {
      const results = await Promise.all(
        services.map(async (service) => {
          const json = await env.STATUS_KV.get(`status:${service.name}`);
          return JSON.parse(json);
        })
      );
      return new Response(JSON.stringify(results, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/") {
      const results = await Promise.all(
        services.map(async (service) => {
          const json = await env.STATUS_KV.get(`status:${service.name}`);
          return JSON.parse(json);
        })
      );
      const html = `
        <html>
          <head><title>Status Monitor</title></head>
          <body>
            <h1>Service Status</h1>
            <ul>
              ${results
                .map(
                  (s) => `
                <li>
                  <strong>${s.name}</strong> - 
                  <span style="color: ${s.ok ? "green" : "red"}">${
                    s.ok ? "UP" : "DOWN"
                  }</span> - 
                  <code>${s.timestamp}</code>
                </li>
              `
                )
                .join("")}
            </ul>
          </body>
        </html>
      `;
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },

  async scheduled(event, env, ctx) {
    for (const service of services) {
      const result = await checkService(service);
      await env.STATUS_KV.put(`status:${service.name}`, JSON.stringify(result), {
        expirationTtl: 3600,
      });
    }
  },
};
