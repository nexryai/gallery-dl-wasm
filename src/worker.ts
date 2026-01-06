// @ts-ignore
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.mjs";

(function() {
    const PROXY_PREFIX = "https://cors-anywhere.herokuapp.com/";
    const originalOpen = XMLHttpRequest.prototype.open;

    // @ts-ignore
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
        let targetUrl = url;

        if (typeof targetUrl === 'string' && targetUrl.startsWith('http')) {
            if (!targetUrl.includes(PROXY_PREFIX) && !targetUrl.includes('cdn.jsdelivr.net')) {
                targetUrl = PROXY_PREFIX + targetUrl;
            }
        }

        // @ts-ignore
        return originalOpen.apply(this, [method, targetUrl, ...args]);
    };
    console.log("XMLHttpRequest hooked for CORS proxy.");
})();

let pyodideReadyPromise = loadPyodide();

self.onmessage = async (event) => {
    const pyodide = await pyodideReadyPromise;
    const { targetUrl } = event.data;

    await pyodide.loadPackage(["micropip"]);
    const micropip = pyodide.pyimport("micropip");

    await micropip.install("pyodide-http");
    await micropip.install("ssl");
    await micropip.install("sqlite3");

    await micropip.install("gallery-dl");

    await pyodide.runPythonAsync(`
        import traceback

        try:
            import sys
            import pyodide_http
            import gallery_dl

            pyodide_http.patch_all()

            # gallery-dl の引数をシミュレート
            sys.argv = [
                "gallery-dl", 
                "${targetUrl}"
            ]

            gallery_dl.main()

        except Exception:
            error_str = traceback.format_exc()
            print(error_str)
            raise
    `);
};
