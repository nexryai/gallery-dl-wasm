import { WorkerEntrypoint } from "cloudflare:workers";

const ALLOWED_DOMAINS = [
  "x.com",
  "reddit.com",
  "redd.it",
];

export default class extends WorkerEntrypoint {
    async fetch(request) {
        const url = new URL(request.url);

        const targetUrl = url.searchParams.get("url");
        if (!targetUrl) {
            return new Response("Missing 'url' parameter", { status: 400 });
        }

        try {
            const parsedTarget = new URL(targetUrl);

            const isAllowed = ALLOWED_DOMAINS.some((domain) => parsedTarget.hostname === domain || parsedTarget.hostname.endsWith("." + domain));
            if (!isAllowed) {
                return new Response("Access to this domain is not allowed", { status: 403 });
            }

            const reqHeaders = new Headers();
            for (const [key, value] of request.headers.entries()) {
                const lowerKey = key.toLowerCase();
                
                if (lowerKey.startsWith("x-proxy-")) {
                    // "x-proxy-accept-encoding" -> "accept-encoding"
                    const originalKey = key.substring(7);
                    reqHeaders.set(originalKey, value);
                } else if (!lowerKey.startsWith("x-") && lowerKey !== "host") {
                    reqHeaders.set(key, value);
                }
            }

            const modifiedRequest = new Request(targetUrl, {
                method: request.method,
                headers: reqHeaders,
                redirect: "follow",
            });

            const response = await fetch(modifiedRequest);

            const resHeaders = new Headers(response.headers);
            resHeaders.set("Access-Control-Allow-Origin", "https://*.app.github.dev");
            resHeaders.delete("Content-Security-Policy");

            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: resHeaders,
            });
        } catch (e) {
            return new Response("Invalid URL format", { status: 400 });
        }
    }
}
