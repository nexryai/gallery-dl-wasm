// @ts-ignore: Vite handles ?worker
import GalleryWorker from "./worker.ts?worker";

import "./hook.js";

export interface DownloadedFile {
    name: string;
    data: Uint8Array;
}

const worker = new GalleryWorker();

export function runGalleryDl(targetUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();

        worker.onmessage = (event) => {
            const { id: responseId, success, error } = event.data;
            if (responseId !== id) return;

            if (success) {
                resolve();
            } else {
                reject(new Error(error));
            }
        };

        worker.onerror = (err) => {
            reject(err);
        };

        // 実行開始
        worker.postMessage({ id, targetUrl });
    });
}
