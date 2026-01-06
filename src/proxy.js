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

            const modifiedRequest = new Request(targetUrl, {
                method: request.method,
                headers: request.headers,
                redirect: "follow",
            });

            const response = await fetch(modifiedRequest);

            const newHeaders = new Headers(response.headers);
            newHeaders.set("Access-Control-Allow-Origin", "*");
            newHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            newHeaders.set("Access-Control-Allow-Headers", "*");
            newHeaders.delete("Content-Security-Policy");

            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: newHeaders,
            });
        } catch (e) {
            return new Response("Invalid URL format", { status: 400 });
        }
    }
}
