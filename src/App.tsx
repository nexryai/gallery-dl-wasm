import { useState, useEffect } from "react";
import { runGalleryDl } from "./runtime";

const GalleryDl: React.FC = () => {
    const [url, setUrl] = useState("https://tenor.com/ja/view/hyacine-amphoreus-honkai-star-rail-hsr-gif-13255669653734151756");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [configContent, setConfigContent] = useState('{\n    "extractor": {\n        "base-directory": "/gallery-dl/"\n    }\n}');

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const root = await navigator.storage.getDirectory();
                const dataDir = await root.getDirectoryHandle("data", { create: true });
                const configFile = await dataDir.getFileHandle("gallery-dl.conf", { create: true });
                const file = await configFile.getFile();
                const text = await file.text();
                if (text) setConfigContent(text);
            } catch (e) {
                console.error(e);
            }
        };
        loadConfig();
    }, []);

    const handleSaveConfig = async () => {
        try {
            const root = await navigator.storage.getDirectory();
            const dataDir = await root.getDirectoryHandle("data", { create: true });
            const configFile = await dataDir.getFileHandle("gallery-dl.conf", { create: true });
            const writable = await configFile.createWritable();

            let dataToSave: any;
            try {
                dataToSave = JSON.parse(configContent);
            } catch {
                dataToSave = configContent;
            }

            await writable.write(typeof dataToSave === "string" ? dataToSave : JSON.stringify(dataToSave, null, 4));
            await writable.close();
            setIsConfigModalOpen(false);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDownload = async () => {
        if (!url) return;

        let directoryHandle: FileSystemDirectoryHandle | undefined;

        if ("showDirectoryPicker" in window) {
            try {
                directoryHandle = await (window as any).showDirectoryPicker({
                    mode: "readwrite",
                });

                // @ts-ignore
                const permissionStatus = await directoryHandle?.requestPermission({
                    mode: "readwrite",
                });

                if (permissionStatus !== "granted") {
                    throw new Error("readwrite access to directory not granted");
                }
            } catch (err: any) {
                if (err.name === "AbortError") return;
                console.error(err);
            }
        }

        setIsLoading(true);
        setError(null);

        try {
            await runGalleryDl(url, directoryHandle);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An error occurred during execution.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl px-4">
            <div className="bg-[#e0e5ec] rounded-[50px] p-8 md:p-12 shadow-[20px_20px_60px_#bec8d4,-20px_-20px_60px_#ffffff] transition-all duration-500 ease-in-out">
                <div className="flex items-center justify-between mb-10">
                    <span className="text-xl font-semibold text-gray-500 tracking-tight">Download from URL</span>
                    <button
                        onClick={() => setIsConfigModalOpen(true)}
                        className="p-2 rounded-full bg-[#e0e5ec] shadow-[4px_4px_8px_#bec8d4,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#bec8d4,inset_-2px_-2px_4px_#ffffff] transition-all duration-300 text-gray-500 hover:text-gray-700 transform hover:scale-110 active:scale-90"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-6 h-6 fill-current">
                            <path d="M195.1 9.5C198.1-5.3 211.2-16 226.4-16l59.8 0c15.2 0 28.3 10.7 31.3 25.5L332 79.5c14.1 6 27.3 13.7 39.3 22.8l67.8-22.5c14.4-4.8 30.2 1.2 37.8 14.4l29.9 51.8c7.6 13.2 4.9 29.8-6.5 39.9L447 233.3c.9 7.4 1.3 15 1.3 22.7s-.5 15.3-1.3 22.7l53.4 47.5c11.4 10.1 14 26.8 6.5 39.9l-29.9 51.8c-7.6 13.1-23.4 19.2-37.8 14.4l-67.8-22.5c-12.1 9.1-25.3 16.7-39.3 22.8l-14.4 69.9c-3.1 14.9-16.2 25.5-31.3 25.5l-59.8 0c-15.2 0-28.3-10.7-31.3-25.5l-14.4-69.9c-14.1-6-27.2-13.7-39.3-22.8L73.5 432.3c-14.4 4.8-30.2-1.2-37.8-14.4L5.8 366.1c-7.6-13.2-4.9-29.8 6.5-39.9l53.4-47.5c-.9-7.4-1.3-15-1.3-22.7s.5-15.3 1.3-22.7L12.3 185.8c-11.4-10.1-14-26.8-6.5-39.9L35.7 94.1c7.6-13.2 23.4-19.2 37.8-14.4l67.8 22.5c12.1-9.1 25.3-16.7 39.3-22.8L195.1 9.5zM256.3 336a80 80 0 1 0 -.6-160 80 80 0 1 0 .6 160z" />
                        </svg>
                    </button>
                </div>
                <div className="space-y-10">
                    <div className="flex flex-col gap-6">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Please enter the URL"
                            className="w-full bg-[#e0e5ec] rounded-2xl px-6 py-4 text-gray-600 outline-none shadow-[inset_8px_8px_16px_#bec8d4,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 ease-in-out placeholder:text-gray-400 focus:shadow-[inset_10px_10px_20px_#bec8d4,inset_-10px_-10px_20px_#ffffff]"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleDownload}
                            disabled={isLoading || !url}
                            className="w-full bg-[#e0e5ec] text-gray-500 py-4 rounded-2xl shadow-[8px_8px_16px_#bec8d4,-8px_-8px_16px_#ffffff] hover:text-gray-600 active:shadow-[inset_6px_6px_12px_#bec8d4,inset_-6px_-6px_12px_#ffffff] transition-all duration-300 ease-in-out disabled:opacity-40 disabled:pointer-events-none transform active:scale-[0.98]"
                        >
                            {isLoading ? "Running..." : "Select Folder & Download"}
                        </button>
                    </div>

                    {isLoading && (
                        <div className="bg-[#e0e5ec] rounded-2xl p-6 shadow-[inset_4px_4px_8px_#bec8d4,inset_-4px_-4px_8px_#ffffff] animate-pulse transition-opacity duration-500">
                            <p className="text-gray-400 text-sm text-center leading-relaxed">
                                Initializing Pyodide and analyzing...
                                <br />
                                This may take a few dozen seconds.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-[#e0e5ec] rounded-2xl p-6 shadow-[8px_8px_16px_#fca5a5,-8px_-8px_16px_#ffffff] border border-red-100 transition-all duration-300">
                            <p className="text-red-400 font-semibold text-center">{error}</p>
                        </div>
                    )}
                </div>
            </div>

            {isConfigModalOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#e0e5ec] w-full max-w-lg rounded-[40px] p-8 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-500 uppercase tracking-widest">Settings</h2>
                            <button onClick={() => setIsConfigModalOpen(false)} className="p-2 rounded-full bg-[#e0e5ec] shadow-[4px_4px_8px_#bec8d4,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#bec8d4,inset_-2px_-2px_4px_#ffffff] transition-all duration-300 text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Gallery-dl Config (JSON)</label>
                                <textarea
                                    value={configContent}
                                    onChange={(e) => setConfigContent(e.target.value)}
                                    className="w-full h-64 bg-[#e0e5ec] rounded-2xl p-4 text-xs font-mono text-gray-600 outline-none shadow-[inset_6px_6px_12px_#bec8d4,inset_-6px_-6px_12px_#ffffff] transition-all duration-300 focus:shadow-[inset_8px_8px_16px_#bec8d4,inset_-8px_-8px_16px_#ffffff]"
                                    spellCheck={false}
                                />
                            </div>

                            <button
                                onClick={handleSaveConfig}
                                className="w-full bg-[#e0e5ec] text-gray-500 font-bold py-4 rounded-2xl shadow-[8px_8px_16px_#bec8d4,-8px_-8px_16px_#ffffff] active:shadow-[inset_6px_6px_12px_#bec8d4,inset_-6px_-6px_12px_#ffffff] transition-all duration-300 uppercase tracking-widest text-sm hover:text-gray-600"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

function App() {
    return (
        <main className="font-[Outfit_Variable] min-h-screen bg-[#e0e5ec] py-8 flex flex-col items-center text-gray-600 transition-colors duration-500">
            <header className="w-full max-w-4xl px-4 mb-16">
                <div className="bg-[#e0e5ec] rounded-full px-8 py-4 flex justify-between items-center shadow-[8px_8px_16px_#bec8d4,-8px_-8px_16px_#ffffff] transition-all duration-300">
                    <span className="text-xl font-bold text-gray-500 tracking-widest uppercase">Gallery-DL WASM</span>
                    <a
                        href="https://github.com/nexryai/gallery-dl-wasm"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-[#e0e5ec] shadow-[4px_4px_8px_#bec8d4,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#bec8d4,inset_-2px_-2px_4px_#ffffff] transition-all duration-300 text-gray-500 hover:text-gray-700 transform hover:scale-110 active:scale-90"
                    >
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                    </a>
                </div>
            </header>

            <GalleryDl />

            <footer className="text-center mt-16 text-gray-400 text-xs tracking-widest opacity-50 uppercase transition-opacity duration-1000">
                ©2026 nexryai All rights reserved. <br />
                Powered by gallery-dl
            </footer>
        </main>
    );
}

export default App;
