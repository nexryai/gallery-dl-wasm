// @ts-ignore: Vite handles ?worker
import GalleryWorker from "./worker.js?worker";
import "./hook.js";

export interface DownloadedFile {
    name: string;
    data: Uint8Array;
}

const worker = new GalleryWorker();

export function runGalleryDl(targetUrl: string, whlUrl: string): Promise<DownloadedFile[]> {
    return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();

        worker.onmessage = (event) => {
            const { id: responseId, type, files, error } = event.data;
            if (responseId !== id) return;

            if (type === "success") {
                resolve(files);
            } else {
                reject(new Error(error));
            }

            // 完了後にWorkerを終了させる
            worker.terminate();
        };

        worker.onerror = (err) => {
            reject(err);
            worker.terminate();
        };

        // 実行開始
        worker.postMessage({ id, targetUrl, whlUrl });
    });
}
