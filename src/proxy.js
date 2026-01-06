import { WorkerEntrypoint } from "cloudflare:workers";

const ALLOWED_DOMAINS = [
  "x.com",
  "reddit.com",
  "redd.it",
  "tenor.com"
];

const CORS_ALLOWED_DOMAINS = [
    ".app.github.dev"
]

export default class extends WorkerEntrypoint {
    async fetch(request) {
        const url = new URL(request.url);

        const requestOrigin = request.headers.get("Origin");
        if (!CORS_ALLOWED_DOMAINS.some(domain => requestOrigin?.endsWith(domain))) {
            return new Response("Not allowed origin", { 
                status: 403,
                headers: {
                    "Access-Control-Allow-Origin": requestOrigin,
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Headers": "*",
                }
            });
        }

        // return 200 if reqeust method is OPTIONS
        if (request.method === "OPTIONS") {
            return new Response("OK", { 
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin": requestOrigin,
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Headers": "*",
                }
            });
        }

        const targetUrl = url.searchParams.get("url");
        if (!targetUrl) {
            return new Response("Missing 'url' parameter", { 
                status: 400,
                headers: {
                    "Access-Control-Allow-Origin": requestOrigin,
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Headers": "*",
                }
            });
        }

        try {
            const parsedTarget = new URL(targetUrl);

            const isAllowed = ALLOWED_DOMAINS.some((domain) => parsedTarget.hostname === domain || parsedTarget.hostname.endsWith("." + domain));
            if (!isAllowed) {
                return new Response("Access to this domain is not allowed", { 
                    status: 403,
                    headers: {
                        "Access-Control-Allow-Origin": requestOrigin,
                        "Access-Control-Allow-Methods": "*",
                        "Access-Control-Allow-Headers": "*",
                    }
                });
            }

            const reqHeaders = new Headers();
            for (const [key, value] of request.headers.entries()) {
                const lowerKey = key.toLowerCase();
                
                if (lowerKey.startsWith("x-proxy-")) {
                    // "x-proxy-accept-encoding" -> "accept-encoding"
                    const originalKey = key.substring(7);
                    reqHeaders.set(originalKey, value);
                }
            }

            const modifiedRequest = new Request(targetUrl, {
                method: request.method,
                headers: reqHeaders,
                redirect: "follow",
            });

            const response = await fetch(modifiedRequest);

            const resHeaders = new Headers(response.headers);
            resHeaders.set("Access-Control-Allow-Origin", requestOrigin);
            resHeaders.set("Access-Control-Allow-Methods", "*");
            resHeaders.set("Access-Control-Allow-Headers", "*");
            resHeaders.delete("Content-Security-Policy");

            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: resHeaders,
            });
        } catch (e) {
            return new Response("Invalid URL", { 
                status: 400,
                headers: {
                    "Access-Control-Allow-Origin": requestOrigin,
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Headers": "*",
                }
            });
        }
    }
}
