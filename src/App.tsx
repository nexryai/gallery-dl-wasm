import { useState } from "react";
import "./App.css";

import { runGalleryDl, type DownloadedFile } from "./runtime";

const GalleryDl: React.FC = () => {
    const [url, setUrl] = useState("https://tenor.com/ja/view/hyacine-amphoreus-honkai-star-rail-hsr-gif-13255669653734151756");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [files, setFiles] = useState<DownloadedFile[]>([]);

    const handleDownload = async () => {
        if (!url) return;

        setIsLoading(true);
        setError(null);
        setFiles([]);

        try {
            const whlUrl = `${window.location.origin}/gallery_dl.whl`;

            const result = await runGalleryDl(url, whlUrl);
            setFiles(result);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "実行中にエラーが発生しました。");
        } finally {
            setIsLoading(false);
        }
    };

    const saveFile = (file: DownloadedFile) => {
        // @ts-ignore
        const blob = new Blob([file.data]);
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = file.name.split("/").pop() || "downloaded_file";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    };

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <h2>gallery-dl Web Runner</h2>

            <div>
                <div style={{ marginBottom: "10px" }}>
                    <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="ターゲットURLを入力 (例: https://...)" style={{ width: "80%", padding: "8px" }} disabled={isLoading} />
                    <button onClick={handleDownload} disabled={isLoading || !url} style={{ padding: "8px 16px", marginLeft: "5px" }}>
                        {isLoading ? "実行中..." : "解析開始"}
                    </button>
                </div>

                {isLoading && <p style={{ color: "#666" }}>Pyodideを初期化し、gallery-dlを実行しています。これには数十秒かかる場合があります...</p>}

                {error && (
                    <div style={{ color: "red", padding: "10px", border: "1px solid red", borderRadius: "4px" }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {files.length > 0 && (
                    <div style={{ marginTop: "20px" }}>
                        <h3>取得済みファイル ({files.length}件)</h3>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {files.map((file, index) => (
                                <li key={index} style={{ marginBottom: "5px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "0.9rem", wordBreak: "break-all" }}>{file.name}</span>
                                    <button onClick={() => saveFile(file)} style={{ marginLeft: "10px" }}>
                                        保存
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

function App() {
    return (
        <>
            <h1>Vite + React</h1>
            <GalleryDl />
            <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
        </>
    );
}

export default App;
