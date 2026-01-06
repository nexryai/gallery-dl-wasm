import { loadPyodide, version as pyodideVersion } from "pyodide";
import "./hook.js";

async function initPyodide() {
    const pyodide = await loadPyodide({
        indexURL: `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/`,
    });

    console.log("Initializing...");
    await pyodide.loadPackage(["micropip"]);
    const micropip = pyodide.pyimport("micropip");

    await micropip.install("pyodide-http");
    await micropip.install("ssl");
    await micropip.install("sqlite3");

    await micropip.install("gallery-dl");

    console.log("pyodide ready!");
    return pyodide;
}

const pyodidePromise = initPyodide();

self.onmessage = async (event) => {
    const { targetUrl } = event.data;
    const pyodide = await pyodidePromise;

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
