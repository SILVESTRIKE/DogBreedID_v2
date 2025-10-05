import { useCallback, useState } from "react";

type PredictResult = {
  // common fields returned by backend
  breed?: string;
  confidence?: number;
  [key: string]: any;
};

type UseDogBreedReturn = {
  predict: (file: File, onProgress?: (progress: number) => void) => Promise<PredictResult>;
  loading: boolean;
  error: string | null;
  result: PredictResult | null;
};

const DEFAULT_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:8000/api/predict";

export default function useDogBreed(apiUrl?: string): UseDogBreedReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResult | null>(null);

  const predict = useCallback(
    (file: File, onProgress?: (progress: number) => void) => {
      const url = apiUrl || DEFAULT_URL;
      setLoading(true);
      setError(null);
      setResult(null);

      return new Promise<PredictResult>((resolve, reject) => {
        const form = new FormData();
        // the backend expects the field name 'file' (adjust if different)
        form.append("file", file);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);

        xhr.withCredentials = false; // set to true if you need cookies/auth

        xhr.upload.onprogress = (e: ProgressEvent) => {
          if (e.lengthComputable && onProgress) {
            const p = e.loaded / e.total;
            try {
              onProgress(p);
            } catch (err) {
              // swallow progress callback errors
              // eslint-disable-next-line no-console
              console.error(err);
            }
          }
        };

        xhr.onreadystatechange = () => {
          if (xhr.readyState !== 4) return;
          setLoading(false);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText || "null");
              setResult(json);
              resolve(json);
            } catch (err) {
              const txt = xhr.responseText || String(err);
              setError("Invalid JSON response from server");
              reject(new Error(txt));
            }
          } else {
            const msg = `HTTP ${xhr.status}: ${xhr.statusText}`;
            setError(msg);
            reject(new Error(msg));
          }
        };

        xhr.onerror = () => {
          setLoading(false);
          const msg = "Network error while uploading file";
          setError(msg);
          reject(new Error(msg));
        };

        try {
          xhr.send(form);
        } catch (err) {
          setLoading(false);
          const msg = String(err instanceof Error ? err.message : err);
          setError(msg);
          reject(new Error(msg));
        }
      });
    },
    [apiUrl]
  );

  return { predict, loading, error, result };
}
