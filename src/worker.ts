import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.mjs";

let pyodideReadyPromise = loadPyodide();

self.onmessage = async (event) => {
    // make sure loading is done
    const pyodide = await pyodideReadyPromise;
    const { id, python, context, targetUrl } = event.data;

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
            # ネットワークブリッジの有効化
            pyodide_http.patch_all()

            # gallery-dl の引数をシミュレート
            # [プログラム名, オプション..., ターゲットURL]
            sys.argv = [
                "gallery-dl", 
                "${targetUrl}"
            ]

            gallery_dl.main()

        except Exception:
            # トレースバックを文字列として取得
            error_str = traceback.format_exc()
            print(error_str) # ブラウザのコンソールに表示
            raise # 再度送出してJS側でもキャッチしたい場合
    `);
};
