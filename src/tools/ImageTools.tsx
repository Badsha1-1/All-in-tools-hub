import React, { useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import { Download, Archive, RotateCcw, Upload, Trash2 } from 'lucide-react';
import { useHub } from '../context/HubContext';
import { downloadBlob, formatBytes, loadImageElement, readFileAsDataUrl, stripExtension } from '../utils/download';

interface ProcessedImageItem {
  id: string;
  originalName: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  outputWidth: number;
  outputHeight: number;
  outputSize: number;
  outputMime: string;
  outputExt: string;
  outputUrl: string;
  outputBlob: Blob;
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Browser failed to encode image.'));
        else resolve(blob);
      },
      mime,
      quality
    );
  });
}

// ============================================================================
// 1. IMAGE RESIZER & BATCH RESIZER
// ============================================================================
export const ImageResizerTool: React.FC = () => {
  const { notify } = useHub();
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<'pixels' | 'percent'>('pixels');
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);
  const [percent, setPercent] = useState(50);
  const [lockAspect, setLockAspect] = useState(true);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState(0.9);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ProcessedImageItem[]>([]);
  const [error, setError] = useState('');

  const handleSelectFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const valid = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (!valid.length) {
      setError('Please select valid image files (JPG, PNG, or WebP).');
      return;
    }
    setError('');
    setFiles(valid);
    setResults([]);
    // Pre-fill dimensions from first image
    readFileAsDataUrl(valid[0])
      .then(loadImageElement)
      .then((img) => {
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
      })
      .catch(() => {});
  };

  const processBatch = async () => {
    if (!files.length) {
      setError('Upload at least one image first.');
      return;
    }
    if (mode === 'pixels' && (width < 1 || height < 1 || width > 10000 || height > 10000)) {
      setError('Enter valid target dimensions between 1 and 10,000 pixels.');
      return;
    }
    setProcessing(true);
    setError('');
    try {
      const processed: ProcessedImageItem[] = [];
      const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';

      for (const file of files) {
        const dataUrl = await readFileAsDataUrl(file);
        const img = await loadImageElement(dataUrl);
        let outW = width;
        let outH = height;

        if (mode === 'percent') {
          const factor = Math.max(0.05, Math.min(4, percent / 100));
          outW = Math.max(1, Math.round(img.naturalWidth * factor));
          outH = Math.max(1, Math.round(img.naturalHeight * factor));
        } else if (lockAspect) {
          const ratio = img.naturalWidth / img.naturalHeight;
          outW = Math.max(1, Math.round(width));
          outH = Math.max(1, Math.round(outW / ratio));
        }

        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context unavailable');
        if (format === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, outW, outH);
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, outW, outH);

        const blob = await canvasToBlob(canvas, format, format === 'image/png' ? undefined : quality);
        processed.push({
          id: `${file.name}_${Date.now()}_${Math.random()}`,
          originalName: file.name,
          originalSize: file.size,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          outputWidth: outW,
          outputHeight: outH,
          outputSize: blob.size,
          outputMime: format,
          outputExt: ext,
          outputUrl: URL.createObjectURL(blob),
          outputBlob: blob,
        });
      }
      setResults(processed);
      notify(`Resized ${processed.length} image${processed.length > 1 ? 's' : ''}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resize images.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadZip = async () => {
    if (!results.length) return;
    const zip = new JSZip();
    results.forEach((item, idx) => {
      zip.file(`${stripExtension(item.originalName)}_${item.outputWidth}x${item.outputHeight}_${idx + 1}.${item.outputExt}`, item.outputBlob);
    });
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, 'smart-tools-hub-resized-images.zip');
    notify('Downloaded resized ZIP archive');
  };

  return (
    <div className="space-y-6">
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors bg-slate-50/70 dark:bg-slate-950/40">
        <Upload className="w-7 h-7 text-blue-600 dark:text-blue-400 mb-2" />
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          Click to upload or drop one or more images (JPG, PNG, WebP)
        </span>
        <span className="text-xs text-slate-500 mt-1">
          {files.length > 0 ? `${files.length} image(s) queued` : 'Supports single and batch resizing'}
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleSelectFiles(e.target.files)}
          className="sr-only"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Resize Mode</label>
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('pixels')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md ${
                mode === 'pixels' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Exact Pixels
            </button>
            <button
              type="button"
              onClick={() => setMode('percent')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md ${
                mode === 'percent' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Percentage
            </button>
          </div>
        </div>

        {mode === 'pixels' ? (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Width (px)</label>
              <input
                type="number"
                min={1}
                max={10000}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Height (px) {lockAspect ? '(auto)' : ''}
              </label>
              <input
                type="number"
                min={1}
                max={10000}
                disabled={lockAspect}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg disabled:opacity-50"
              />
            </div>
          </>
        ) : (
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Scale Percentage: <span className="font-mono tabular-nums">{percent}%</span>
            </label>
            <input
              type="range"
              min={10}
              max={200}
              step={5}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              className="w-full accent-blue-600 mt-2"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Output Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'image/jpeg' | 'image/png' | 'image/webp')}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
          >
            <option value="image/jpeg">JPG (Smaller size)</option>
            <option value="image/png">PNG (Lossless)</option>
            <option value="image/webp">WebP (Modern web)</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5">
          {mode === 'pixels' && (
            <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={lockAspect}
                onChange={(e) => setLockAspect(e.target.checked)}
                className="accent-blue-600 rounded"
              />
              <span>Lock aspect ratio</span>
            </label>
          )}
          {format !== 'image/png' && (
            <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span>Quality ({Math.round(quality * 100)}%)</span>
              <input
                type="range"
                min={0.3}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-28 accent-blue-600"
              />
            </label>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={processing || !files.length}
            onClick={processBatch}
            className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {processing ? 'Processing...' : `Resize ${files.length > 1 ? `${files.length} Images` : 'Image'}`}
          </button>
          {results.length > 1 && (
            <button
              type="button"
              onClick={downloadZip}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg cursor-pointer"
            >
              <Archive className="w-4 h-4" />
              <span>Download ZIP</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setFiles([]);
              setResults([]);
              setError('');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {results.length > 0 && (
        <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          {results.map((item) => (
            <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-950/40">
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={item.outputUrl}
                  alt={item.originalName}
                  className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.originalName}</p>
                  <p className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 mt-1">
                    {item.originalWidth}×{item.originalHeight} ({formatBytes(item.originalSize)}) →{' '}
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {item.outputWidth}×{item.outputHeight} ({formatBytes(item.outputSize)})
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  downloadBlob(
                    item.outputBlob,
                    `${stripExtension(item.originalName)}_${item.outputWidth}x${item.outputHeight}.${item.outputExt}`
                  )
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. IMAGE COMPRESSOR & TARGET KB REDUCER
// ============================================================================
export const ImageCompressorTool: React.FC = () => {
  const { notify } = useHub();
  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState('');
  const [mode, setMode] = useState<'quality' | 'targetKb'>('targetKb');
  const [quality, setQuality] = useState(0.75);
  const [targetKb, setTargetKb] = useState(50);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/webp'>('image/jpeg');
  const [result, setResult] = useState<{ blob: Blob; url: string; width: number; height: number; note: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onFile = async (f: File | undefined) => {
    if (!f || !f.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    setError('');
    setFile(f);
    setResult(null);
    const dataUrl = await readFileAsDataUrl(f);
    setPreviewSrc(dataUrl);
  };

  const compress = async () => {
    if (!file || !previewSrc) return;
    setBusy(true);
    setError('');
    try {
      const img = await loadImageElement(previewSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');

      const renderAt = async (scale: number, q: number): Promise<Blob> => {
        const w = Math.max(32, Math.round(img.naturalWidth * scale));
        const h = Math.max(32, Math.round(img.naturalHeight * scale));
        canvas.width = w;
        canvas.height = h;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        return canvasToBlob(canvas, outputFormat, q);
      };

      let bestBlob: Blob;
      let note = '';

      if (mode === 'quality') {
        bestBlob = await renderAt(1, quality);
        note = `Compressed at ${Math.round(quality * 100)}% quality.`;
      } else {
        const targetBytes = Math.max(5, targetKb) * 1024;
        let low = 0.08;
        let high = 0.95;
        let scale = 1;
        bestBlob = await renderAt(1, 0.85);

        // Try binary search on quality first, then gently scale down if needed
        for (let pass = 0; pass < 4; pass++) {
          low = 0.08;
          high = 0.95;
          let passBest: Blob | null = null;
          for (let i = 0; i < 7; i++) {
            const mid = (low + high) / 2;
            const candidate = await renderAt(scale, mid);
            if (candidate.size <= targetBytes) {
              passBest = candidate;
              low = mid;
            } else {
              high = mid;
            }
          }
          if (passBest) {
            bestBlob = passBest;
            note =
              scale < 1
                ? `Reached target ≤ ${targetKb} KB (scaled to ${Math.round(scale * 100)}% dimensions).`
                : `Reached target ≤ ${targetKb} KB at original dimensions.`;
            break;
          }
          bestBlob = await renderAt(scale, 0.08);
          scale *= 0.72;
          note = `Achieved ${formatBytes(bestBlob.size)} (closest possible to ${targetKb} KB).`;
        }
      }

      setResult({
        blob: bestBlob,
        url: URL.createObjectURL(bestBlob),
        width: canvas.width,
        height: canvas.height,
        note,
      });
      notify('Image compressed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compression failed.');
    } finally {
      setBusy(false);
    }
  };

  const savingsPct =
    file && result ? Math.round(((file.size - result.blob.size) / Math.max(1, file.size)) * 100) : 0;

  return (
    <div className="space-y-6">
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors bg-slate-50/70 dark:bg-slate-950/40">
        <Upload className="w-7 h-7 text-blue-600 dark:text-blue-400 mb-2" />
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {file ? `${file.name} (${formatBytes(file.size)})` : 'Select a photo to compress'}
        </span>
        <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="sr-only" />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Compression Mode</label>
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('targetKb')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md ${
                mode === 'targetKb' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Target KB Preset
            </button>
            <button
              type="button"
              onClick={() => setMode('quality')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md ${
                mode === 'quality' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Manual Quality
            </button>
          </div>
        </div>

        {mode === 'targetKb' ? (
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Target Max Size (KB)</label>
            <div className="flex items-center gap-1.5">
              {[20, 50, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTargetKb(preset)}
                  className={`px-2.5 py-2 text-xs font-mono rounded-lg border cursor-pointer ${
                    targetKb === preset
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {preset}KB
                </button>
              ))}
              <input
                type="number"
                min={5}
                max={5000}
                value={targetKb}
                onChange={(e) => setTargetKb(Number(e.target.value))}
                className="w-20 px-2.5 py-2 text-xs font-mono tabular-nums bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Quality: <span className="font-mono tabular-nums">{Math.round(quality * 100)}%</span>
            </label>
            <input
              type="range"
              min={0.1}
              max={0.95}
              step={0.05}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Output Format</label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as 'image/jpeg' | 'image/webp')}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
          >
            <option value="image/jpeg">JPEG (.jpg)</option>
            <option value="image/webp">WebP (.webp)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!file || busy}
          onClick={compress}
          className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
        >
          {busy ? 'Compressing...' : 'Compress Image'}
        </button>
        <button
          type="button"
          onClick={() => {
            setFile(null);
            setPreviewSrc('');
            setResult(null);
            setError('');
          }}
          className="px-4 py-2.5 text-sm font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer"
        >
          Reset
        </button>
      </div>

      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {file && result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">
              Original · <span className="font-mono tabular-nums">{formatBytes(file.size)}</span>
            </p>
            <img src={previewSrc} alt="Original preview" className="max-h-72 w-full object-contain bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500">
                Compressed ·{' '}
                <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-semibold">
                  {formatBytes(result.blob.size)} ({savingsPct >= 0 ? `-${savingsPct}%` : `+${Math.abs(savingsPct)}%`})
                </span>
              </p>
              <button
                type="button"
                onClick={() =>
                  downloadBlob(
                    result.blob,
                    `${stripExtension(file.name)}_compressed.${outputFormat === 'image/webp' ? 'webp' : 'jpg'}`
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
            <img src={result.url} alt="Compressed preview" className="max-h-72 w-full object-contain bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800" />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {result.note} Output: {result.width}×{result.height}px.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. IMAGE CROPPER
// ============================================================================
export const ImageCropperTool: React.FC = () => {
  const { notify } = useHub();
  const [file, setFile] = useState<File | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [aspect, setAspect] = useState<'free' | '1:1' | '4:3' | '16:9' | '4:5'>('1:1');
  const [cropX, setCropX] = useState(10);
  const [cropY, setCropY] = useState(10);
  const [cropW, setCropW] = useState(80);
  const [cropH, setCropH] = useState(80);
  const [format, setFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const onFile = async (f: File | undefined) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    const dataUrl = await readFileAsDataUrl(f);
    const loaded = await loadImageElement(dataUrl);
    setImgEl(loaded);
    setCropX(10);
    setCropY(10);
    setCropW(80);
    setCropH(80);
  };

  useEffect(() => {
    if (!imgEl || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const maxDisplay = 520;
    const scale = Math.min(1, maxDisplay / imgEl.naturalWidth, maxDisplay / imgEl.naturalHeight);
    canvas.width = Math.round(imgEl.naturalWidth * scale);
    canvas.height = Math.round(imgEl.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);

    // Compute pixel crop box
    const sx = (cropX / 100) * canvas.width;
    const sy = (cropY / 100) * canvas.height;
    const sw = Math.min(canvas.width - sx, (cropW / 100) * canvas.width);
    let sh = Math.min(canvas.height - sy, (cropH / 100) * canvas.height);

    if (aspect !== 'free') {
      const ratios: Record<string, number> = { '1:1': 1, '4:3': 4 / 3, '16:9': 16 / 9, '4:5': 4 / 5 };
      const desired = ratios[aspect];
      sh = sw / desired;
      if (sy + sh > canvas.height) sh = canvas.height - sy;
    }

    // Dim outside crop area
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.fillRect(0, 0, canvas.width, sy);
    ctx.fillRect(0, sy + sh, canvas.width, canvas.height - (sy + sh));
    ctx.fillRect(0, sy, sx, sh);
    ctx.fillRect(sx + sw, sy, canvas.width - (sx + sw), sh);

    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, sw, sh);
  }, [imgEl, cropX, cropY, cropW, cropH, aspect]);

  const downloadCrop = async () => {
    if (!imgEl || !file) return;
    const sx = Math.round((cropX / 100) * imgEl.naturalWidth);
    const sy = Math.round((cropY / 100) * imgEl.naturalHeight);
    let sw = Math.max(1, Math.min(imgEl.naturalWidth - sx, Math.round((cropW / 100) * imgEl.naturalWidth)));
    let sh = Math.max(1, Math.min(imgEl.naturalHeight - sy, Math.round((cropH / 100) * imgEl.naturalHeight)));
    if (aspect !== 'free') {
      const ratios: Record<string, number> = { '1:1': 1, '4:3': 4 / 3, '16:9': 16 / 9, '4:5': 4 / 5 };
      sh = Math.round(sw / ratios[aspect]);
      if (sy + sh > imgEl.naturalHeight) {
        sh = imgEl.naturalHeight - sy;
        sw = Math.round(sh * ratios[aspect]);
      }
    }
    const out = document.createElement('canvas');
    out.width = sw;
    out.height = sh;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, sw, sh);
    const blob = await canvasToBlob(out, format, 0.92);
    downloadBlob(blob, `${stripExtension(file.name)}_cropped_${sw}x${sh}.${format === 'image/png' ? 'png' : 'jpg'}`);
    notify(`Cropped image downloaded (${sw}×${sh}px)`);
  };

  return (
    <div className="space-y-6">
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 transition-colors bg-slate-50/70 dark:bg-slate-950/40">
        <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-1.5" />
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {file ? `${file.name} (${imgEl?.naturalWidth ?? 0}×${imgEl?.naturalHeight ?? 0}px)` : 'Upload an image to crop'}
        </span>
        <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="sr-only" />
      </label>

      {imgEl && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="flex justify-center bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <canvas ref={previewCanvasRef} className="max-w-full h-auto rounded" />
          </div>

          <div className="space-y-4">
            <div>
              <span className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Aspect Ratio</span>
              <div className="flex flex-wrap gap-1.5">
                {(['free', '1:1', '4:3', '16:9', '4:5'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setAspect(r)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer ${
                      aspect === r
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {r === 'free' ? 'Free' : r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs text-slate-600 dark:text-slate-400">
                Left Offset X: <span className="font-mono">{cropX}%</span>
                <input type="range" min={0} max={85} value={cropX} onChange={(e) => setCropX(Number(e.target.value))} className="w-full accent-blue-600" />
              </label>
              <label className="block text-xs text-slate-600 dark:text-slate-400">
                Top Offset Y: <span className="font-mono">{cropY}%</span>
                <input type="range" min={0} max={85} value={cropY} onChange={(e) => setCropY(Number(e.target.value))} className="w-full accent-blue-600" />
              </label>
              <label className="block text-xs text-slate-600 dark:text-slate-400">
                Crop Width: <span className="font-mono">{cropW}%</span>
                <input type="range" min={10} max={100 - cropX} value={Math.min(cropW, 100 - cropX)} onChange={(e) => setCropW(Number(e.target.value))} className="w-full accent-blue-600" />
              </label>
              {aspect === 'free' && (
                <label className="block text-xs text-slate-600 dark:text-slate-400">
                  Crop Height: <span className="font-mono">{cropH}%</span>
                  <input type="range" min={10} max={100 - cropY} value={Math.min(cropH, 100 - cropY)} onChange={(e) => setCropH(Number(e.target.value))} className="w-full accent-blue-600" />
                </label>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as 'image/png' | 'image/jpeg')}
                className="px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                <option value="image/png">PNG (Lossless)</option>
                <option value="image/jpeg">JPEG</option>
              </select>
              <button
                type="button"
                onClick={downloadCrop}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Cropped</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. JPG / PNG / WEBP FORMAT CONVERTER
// ============================================================================
export const ImageFormatConverterTool: React.FC = () => {
  const { notify } = useHub();
  const [files, setFiles] = useState<File[]>([]);
  const [target, setTarget] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [quality, setQuality] = useState(0.92);
  const [outputs, setOutputs] = useState<ProcessedImageItem[]>([]);
  const [busy, setBusy] = useState(false);

  const convert = async () => {
    if (!files.length) return;
    setBusy(true);
    try {
      const ext = target === 'image/png' ? 'png' : target === 'image/webp' ? 'webp' : 'jpg';
      const items: ProcessedImageItem[] = [];
      for (const file of files) {
        const img = await loadImageElement(await readFileAsDataUrl(file));
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        if (target === 'image/jpeg') {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        const blob = await canvasToBlob(canvas, target, target === 'image/png' ? undefined : quality);
        items.push({
          id: `${file.name}_${Math.random()}`,
          originalName: file.name,
          originalSize: file.size,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          outputWidth: img.naturalWidth,
          outputHeight: img.naturalHeight,
          outputSize: blob.size,
          outputMime: target,
          outputExt: ext,
          outputUrl: URL.createObjectURL(blob),
          outputBlob: blob,
        });
      }
      setOutputs(items);
      notify(`Converted ${items.length} file(s) to ${ext.toUpperCase()}`);
    } finally {
      setBusy(false);
    }
  };

  const downloadAllZip = async () => {
    const zip = new JSZip();
    outputs.forEach((item, i) => zip.file(`${stripExtension(item.originalName)}_${i + 1}.${item.outputExt}`, item.outputBlob));
    downloadBlob(await zip.generateAsync({ type: 'blob' }), 'converted-images.zip');
  };

  return (
    <div className="space-y-6">
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 bg-slate-50/70 dark:bg-slate-950/40">
        <Upload className="w-7 h-7 text-blue-600 dark:text-blue-400 mb-2" />
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {files.length ? `${files.length} image(s) ready to convert` : 'Select JPG, PNG, or WebP images'}
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files?.length) {
              setFiles(Array.from(e.target.files).filter((f) => f.type.startsWith('image/')));
              setOutputs([]);
            }
          }}
          className="sr-only"
        />
      </label>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Convert To</label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as 'image/png' | 'image/jpeg' | 'image/webp')}
            className="px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
          >
            <option value="image/png">PNG (.png)</option>
            <option value="image/jpeg">JPG (.jpg)</option>
            <option value="image/webp">WebP (.webp)</option>
          </select>
        </div>

        {target === 'image/jpeg' && (
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Transparency Fill</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-16 rounded border border-slate-300 dark:border-slate-700" />
          </div>
        )}

        {target !== 'image/png' && (
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Quality ({Math.round(quality * 100)}%)
            </label>
            <input type="range" min={0.4} max={1} step={0.04} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-32 accent-blue-600" />
          </div>
        )}

        <button
          type="button"
          disabled={!files.length || busy}
          onClick={convert}
          className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
        >
          {busy ? 'Converting...' : 'Convert Images'}
        </button>

        {outputs.length > 1 && (
          <button
            type="button"
            onClick={downloadAllZip}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg cursor-pointer"
          >
            <Archive className="w-4 h-4" />
            <span>Download ZIP</span>
          </button>
        )}
      </div>

      {outputs.length > 0 && (
        <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          {outputs.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img src={item.outputUrl} alt={item.originalName} className="w-12 h-12 object-cover rounded border border-slate-200 dark:border-slate-800" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{stripExtension(item.originalName)}.{item.outputExt}</p>
                  <p className="text-xs font-mono tabular-nums text-slate-500">
                    {formatBytes(item.originalSize)} → {formatBytes(item.outputSize)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => downloadBlob(item.outputBlob, `${stripExtension(item.originalName)}.${item.outputExt}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 5. PASSPORT PHOTO MAKER & PRINTABLE A4 SHEET
// ============================================================================
const PASSPORT_PRESETS = [
  { id: 'eu', label: '35 × 45 mm (India / EU / UK / BD)', wMm: 35, hMm: 45 },
  { id: 'us', label: '51 × 51 mm (2 × 2 in US / Visa)', wMm: 51, hMm: 51 },
  { id: 'cn', label: '33 × 48 mm (China / ID)', wMm: 33, hMm: 48 },
];

export const PassportPhotoMakerTool: React.FC = () => {
  const { notify } = useHub();
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [presetId, setPresetId] = useState('eu');
  const [zoom, setZoom] = useState(1.1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [copies, setCopies] = useState(8);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const preset = PASSPORT_PRESETS.find((p) => p.id === presetId) || PASSPORT_PRESETS[0];
  const pxW = Math.round((preset.wMm / 25.4) * 300);
  const pxH = Math.round((preset.hMm / 25.4) * 300);

  const drawSingle = (canvas: HTMLCanvasElement) => {
    canvas.width = pxW;
    canvas.height = pxH;
    const ctx = canvas.getContext('2d');
    if (!ctx || !imgEl) return;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, pxW, pxH);

    const coverScale = Math.max(pxW / imgEl.naturalWidth, pxH / imgEl.naturalHeight) * zoom;
    const drawW = imgEl.naturalWidth * coverScale;
    const drawH = imgEl.naturalHeight * coverScale;
    const dx = (pxW - drawW) / 2 + (offsetX / 100) * pxW;
    const dy = (pxH - drawH) / 2 + (offsetY / 100) * pxH;
    ctx.drawImage(imgEl, dx, dy, drawW, drawH);
  };

  useEffect(() => {
    if (imgEl && canvasRef.current) drawSingle(canvasRef.current);
  }, [imgEl, presetId, zoom, offsetX, offsetY, bgColor]);

  const downloadSingle = async () => {
    if (!canvasRef.current) return;
    const blob = await canvasToBlob(canvasRef.current, 'image/jpeg', 0.95);
    downloadBlob(blob, `passport_${preset.wMm}x${preset.hMm}mm_300dpi.jpg`);
    notify('Single passport photo downloaded');
  };

  const downloadA4Sheet = async () => {
    if (!canvasRef.current) return;
    // A4 at 300 DPI = 2480 x 3508 px
    const a4 = document.createElement('canvas');
    a4.width = 2480;
    a4.height = 3508;
    const ctx = a4.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, a4.width, a4.height);

    const gap = 45;
    const margin = 120;
    const cols = Math.max(1, Math.floor((a4.width - margin * 2 + gap) / (pxW + gap)));

    for (let i = 0; i < copies; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = margin + col * (pxW + gap);
      const y = margin + row * (pxH + gap);
      if (y + pxH > a4.height - margin) break;
      ctx.drawImage(canvasRef.current, x, y);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, pxW, pxH);
    }

    const blob = await canvasToBlob(a4, 'image/jpeg', 0.95);
    downloadBlob(blob, `passport_a4_sheet_${copies}_copies.jpg`);
    notify('Printable A4 passport photo sheet downloaded');
  };

  return (
    <div className="space-y-6">
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 bg-slate-50/70 dark:bg-slate-950/40">
        <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-1.5" />
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          Upload a clear front-facing portrait photo
        </span>
        <span className="text-xs text-slate-500 mt-1">
          300 DPI print-ready output · No external AI background upload
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setImgEl(await loadImageElement(await readFileAsDataUrl(f)));
          }}
          className="sr-only"
        />
      </label>

      {imgEl && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col items-center bg-slate-100 dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <canvas ref={canvasRef} className="max-h-80 w-auto border border-slate-300 shadow-xs" />
            <p className="mt-3 text-xs font-mono tabular-nums text-slate-500">
              {preset.wMm}×{preset.hMm}mm · {pxW}×{pxH}px @ 300 DPI
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Standard Size Preset</label>
              <select
                value={presetId}
                onChange={(e) => setPresetId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                {PASSPORT_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <label className="block text-xs text-slate-600 dark:text-slate-400">
              Zoom: <span className="font-mono">{zoom.toFixed(2)}×</span>
              <input type="range" min={0.6} max={2.5} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-blue-600" />
            </label>
            <label className="block text-xs text-slate-600 dark:text-slate-400">
              Horizontal Position: <span className="font-mono">{offsetX}%</span>
              <input type="range" min={-40} max={40} value={offsetX} onChange={(e) => setOffsetX(Number(e.target.value))} className="w-full accent-blue-600" />
            </label>
            <label className="block text-xs text-slate-600 dark:text-slate-400">
              Vertical Position: <span className="font-mono">{offsetY}%</span>
              <input type="range" min={-40} max={40} value={offsetY} onChange={(e) => setOffsetY(Number(e.target.value))} className="w-full accent-blue-600" />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Background Fill</label>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-full rounded border border-slate-300 dark:border-slate-700" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">A4 Sheet Copies</label>
                <select value={copies} onChange={(e) => setCopies(Number(e.target.value))} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
                  {[4, 8, 12, 16, 20].map((n) => (
                    <option key={n} value={n}>{n} copies</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={downloadSingle}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Single Photo</span>
              </button>
              <button
                type="button"
                onClick={downloadA4Sheet}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download A4 Print Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 6. SIGNATURE RESIZER
// ============================================================================
export const SignatureResizerTool: React.FC = () => {
  const { notify } = useHub();
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(80);
  const [contrast, setContrast] = useState(115);
  const [maxKb, setMaxKb] = useState(20);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);

  const generateSignature = async () => {
    if (!imgEl) return;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(40, width);
    canvas.height = Math.max(20, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.filter = `contrast(${contrast}%) brightness(105%)`;

    const scale = Math.min(canvas.width / imgEl.naturalWidth, canvas.height / imgEl.naturalHeight);
    const dw = imgEl.naturalWidth * scale;
    const dh = imgEl.naturalHeight * scale;
    ctx.drawImage(imgEl, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);

    let q = 0.92;
    let blob = await canvasToBlob(canvas, 'image/jpeg', q);
    while (blob.size > maxKb * 1024 && q > 0.15) {
      q -= 0.08;
      blob = await canvasToBlob(canvas, 'image/jpeg', q);
    }

    setResult({ blob, url: URL.createObjectURL(blob) });
    notify(`Signature ready (${formatBytes(blob.size)})`);
  };

  return (
    <div className="space-y-6">
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 bg-slate-50/70 dark:bg-slate-950/40">
        <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-1.5" />
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          Upload scanned or photographed signature
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setImgEl(await loadImageElement(await readFileAsDataUrl(f)));
            setResult(null);
          }}
          className="sr-only"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {[
          { label: '140 × 60 px (20 KB)', w: 140, h: 60, kb: 20 },
          { label: '200 × 80 px (20 KB)', w: 200, h: 80, kb: 20 },
          { label: '300 × 80 px (50 KB)', w: 300, h: 80, kb: 50 },
        ].map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setWidth(p.w);
              setHeight(p.h);
              setMaxKb(p.kb);
            }}
            className="px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg hover:border-blue-500 cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Width (px)</label>
          <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Height (px)</label>
          <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Max Size (KB)</label>
          <input type="number" min={5} max={500} value={maxKb} onChange={(e) => setMaxKb(Number(e.target.value))} className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Contrast Clean-Up ({contrast}%)</label>
          <input type="range" min={100} max={200} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full accent-blue-600 mt-2" />
        </div>
      </div>

      <button
        type="button"
        disabled={!imgEl}
        onClick={generateSignature}
        className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
      >
        Generate Signature
      </button>

      {result && (
        <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={result.url} alt="Resized signature" className="border border-slate-300 bg-white rounded" />
            <div className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
              {width}×{height}px · {formatBytes(result.blob.size)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadBlob(result.blob, `signature_${width}x${height}.jpg`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JPG</span>
            </button>
            <button
              type="button"
              onClick={() => setResult(null)}
              aria-label="Clear preview"
              className="p-2 text-slate-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
