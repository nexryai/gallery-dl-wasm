import { loadPyodide, version as pyodideVersion } from "pyodide";
import "./hook.js";

async function getDataDirectoryHandle() {
    const root = await navigator.storage.getDirectory();
    return root.getDirectoryHandle("data", { create: true });
}

async function getFallbackOutDirectoryHandle() {
    const root = await navigator.storage.getDirectory();
    return root.getDirectoryHandle("out", { create: true });
}

async function initPyodide() {
    const pyodide = await loadPyodide({
        indexURL: `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/`,
    });

    await pyodide.loadPackage(["micropip"]);
    const micropip = pyodide.pyimport("micropip");

    await micropip.install("pyodide-http");
    await micropip.install("ssl");
    await micropip.install("sqlite3");
    await micropip.install("gallery-dl");

    return pyodide;
}

const dataDirectoryHandlePromise = getDataDirectoryHandle();
const pyodidePromise = initPyodide();

self.onmessage = async (event) => {
    const {
        id,
        targetUrl,
        outDirectoryHandle,
    }: {
        id: string;
        targetUrl: string;
        outDirectoryHandle?: FileSystemDirectoryHandle;
    } = event.data;

    if (!targetUrl) {
        return;
    }

    const pyodide = await pyodidePromise;

    console.log(outDirectoryHandle);
    const outDirectory = await pyodide.mountNativeFS("/gallery-dl", outDirectoryHandle ?? (await getFallbackOutDirectoryHandle()));
    await pyodide.mountNativeFS("/data", await dataDirectoryHandlePromise);

    await pyodide.runPythonAsync(`
        import traceback
        import sys
        import os
        import pyodide_http
        import gallery_dl

        try:
            pyodide_http.patch_all()

            config_path = "/data/gallery-dl.conf"
            args = ["gallery-dl"]
            
            if os.path.exists(config_path):
                args.extend(["-c", config_path])
            
            args.append("${targetUrl}")
            sys.argv = args

            gallery_dl.main()

        except Exception:
            error_str = traceback.format_exc()
            print(error_str)
            raise
    `);

    await outDirectory.syncfs();

    self.postMessage({
        id: id,
        success: true,
    });
};
