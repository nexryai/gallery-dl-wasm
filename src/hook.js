const WORKER_ENDPOINT = "/proxy?url=";
const BYPASS_DOMAINS = ["cdn.jsdelivr.net", "pyodide.org", "pypi.org", "files.pythonhosted.org", "workers.dev"];

(function () {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

    XMLHttpRequest.prototype.open = function (method, url, ...args) {
        let targetUrl = url;

        if (typeof targetUrl === "string" && targetUrl.startsWith("http")) {
            const isBypass = BYPASS_DOMAINS.some((domain) => targetUrl.includes(domain));
            if (!isBypass) {
                targetUrl = WORKER_ENDPOINT + encodeURIComponent(targetUrl);
            }
        }

        return originalOpen.apply(this, [method, targetUrl, ...args]);
    };

    XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
        console.debug(`Header added: ${header}`);
        originalSetRequestHeader.apply(this, [`X-Proxy-${header}`, value]);
    };

    console.debug("XMLHttpRequest hooked!");
})();

(function () {
    if (typeof globalThis.fetch === "undefined") {
        return;
    }

    const originalFetch = globalThis.fetch;

    globalThis.fetch = async function (input, init) {
        let url;

        if (input instanceof Request) {
            url = input.url;
        } else {
            url = String(input);
        }

        const isBypass = BYPASS_DOMAINS.some((domain) => url.includes(domain));

        if (url.startsWith("http") && !isBypass) {
            const proxyUrl = WORKER_ENDPOINT + encodeURIComponent(url);

            const newInit = { ...(init || {}) };
            const oldHeaders = new Headers((input instanceof Request ? input.headers : init?.headers) || {});

            const proxyHeaders = new Headers();
            oldHeaders.forEach((value, key) => {
                proxyHeaders.set(`X-Proxy-${key}`, value);
            });
            newInit.headers = proxyHeaders;

            console.log("fetch proxy:", proxyUrl);

            if (input instanceof Request) {
                const newRequest = new Request(proxyUrl, input);
                return originalFetch.call(this, newRequest, { headers: proxyHeaders });
            }

            return originalFetch.call(this, proxyUrl, newInit);
        }

        return originalFetch.apply(this, arguments);
    };

    console.debug("fetch hooked (global)!");
})();
