import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.mjs";
import "./hook.js";

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
