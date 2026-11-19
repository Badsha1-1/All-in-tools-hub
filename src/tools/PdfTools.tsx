import React, { useState } from 'react';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import JSZip from 'jszip';
import { Archive, ArrowDown, ArrowUp, Copy, Download, RotateCw, Trash2, Upload } from 'lucide-react';
import { useHub } from '../context/HubContext';
import { copyToClipboard, downloadBlob, formatBytes, stripExtension } from '../utils/download';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function pdfBytesToBlob(bytes: Uint8Array): Blob {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy.buffer], { type: 'application/pdf' });
}

function parsePageRange(input: string, totalPages: number): number[] {
  const result = new Set<number>();
  const parts = input
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  for (const part of parts) {
    if (part.includes('-')) {
      const [aStr, bStr] = part.split('-');
      const a = Number(aStr);
      const b = Number(bStr);
      if (!Number.isInteger(a) || !Number.isInteger(b) || a < 1 || b < 1 || a > totalPages || b > totalPages || a > b) {
        throw new Error(`Invalid range "${part}". Valid pages are 1 to ${totalPages}.`);
      }
      for (let i = a; i <= b; i++) result.add(i - 1);
    } else {
      const n = Number(part);
      if (!Number.isInteger(n) || n < 1 || n > totalPages) {
        throw new Error(`Invalid page "${part}". Valid pages are 1 to ${totalPages}.`);
      }
      result.add(n - 1);
    }
  }
  return Array.from(result).sort((x, y) => x - y);
}

// ============================================================================
// 1. JPG & PNG TO PDF
// ============================================================================
export const JpgToPdfTool: React.FC = () => {
  const { notify } = useHub();
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState(24);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...files];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setFiles(next);
  };

  const buildPdf = async () => {
    if (!files.length) return;
    setBusy(true);
    setError('');
    try {
      const pdfDoc = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        let embedded;
        if (file.type === 'image/png') {
          embedded = await pdfDoc.embedPng(bytes);
        } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          embedded = await pdfDoc.embedJpg(bytes);
        } else {
          // Convert WebP or other image types to PNG via Canvas first
          const bitmap = await createImageBitmap(file);
          const canvas = document.createElement('canvas');
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          canvas.getContext('2d')?.drawImage(bitmap, 0, 0);
          const pngBlob = await new Promise<Blob>((res, rej) =>
            canvas.toBlob((b) => (b ? res(b) : rej(new Error('Image conversion failed'))), 'image/png')
          );
          embedded = await pdfDoc.embedPng(await pngBlob.arrayBuffer());
        }

        const imgW = embedded.width;
        const imgH = embedded.height;

        if (pageSize === 'fit') {
          const page = pdfDoc.addPage([imgW + margin * 2, imgH + margin * 2]);
          page.drawImage(embedded, { x: margin, y: margin, width: imgW, height: imgH });
        } else {
          const baseW = pageSize === 'letter' ? 612 : 595.28;
          const baseH = pageSize === 'letter' ? 792 : 841.89;
          const pw = orientation === 'landscape' ? baseH : baseW;
          const ph = orientation === 'landscape' ? baseW : baseH;
          const page = pdfDoc.addPage([pw, ph]);
          const maxW = Math.max(20, pw - margin * 2);
          const maxH = Math.max(20, ph - margin * 2);
          const scale = Math.min(maxW / imgW, maxH / imgH);
          const dw = imgW * scale;
          const dh = imgH * scale;
          page.drawImage(embedded, { x: (pw - dw) / 2, y: (ph - dh) / 2, width: dw, height: dh });
        }
      }

      const pdfBytes = await pdfDoc.save();
      downloadBlob(pdfBytesToBlob(pdfBytes), 'images-to-pdf.pdf');
      notify(`Created ${files.length}-page PDF`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to build PDF.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 bg-slate-50/70 dark:bg-slate-950/40">
        <Upload className="w-7 h-7 text-blue-600 dark:text-blue-400 mb-2" />
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          Upload JPG, PNG, or WebP images to combine into a PDF
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files?.length) {
              setFiles((prev) => [...prev, ...Array.from(e.target.files!).filter((f) => f.type.startsWith('image/'))]);
            }
          }}
          className="sr-only"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Page Size</label>
          <select value={pageSize} onChange={(e) => setPageSize(e.target.value as 'a4' | 'letter' | 'fit')} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
            <option value="a4">A4 (210 × 297 mm)</option>
            <option value="letter">US Letter (8.5 × 11 in)</option>
            <option value="fit">Fit to Image Dimensions</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Orientation</label>
          <select disabled={pageSize === 'fit'} value={orientation} onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg disabled:opacity-50">
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Margin ({margin} pt)</label>
          <input type="range" min={0} max={72} value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full accent-blue-600 mt-2" />
        </div>
      </div>

      {files.length > 0 && (
        <ul className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl">
          {files.map((file, idx) => (
            <li key={`${file.name}_${idx}`} className="px-4 py-3 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium">
                <span className="font-mono text-xs text-slate-400 mr-2">{idx + 1}.</span>
                {file.name} <span className="text-xs text-slate-500">({formatBytes(file.size)})</span>
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} aria-label="Move up" className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => move(idx, 1)} disabled={idx === files.length - 1} aria-label="Move down" className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30">
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setFiles(files.filter((_, i) => i !== idx))} aria-label="Remove image" className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="button" disabled={!files.length || busy} onClick={buildPdf} className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
          {busy ? 'Generating PDF...' : `Create PDF (${files.length} pages)`}
        </button>
        {files.length > 0 && (
          <button type="button" onClick={() => setFiles([])} className="px-4 py-2.5 text-sm font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer">
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 2. PDF TO JPG / PNG CONVERTER
// ============================================================================
interface RenderedPdfPage {
  pageNum: number;
  url: string;
  blob: Blob;
  width: number;
  height: number;
}

export const PdfToJpgTool: React.FC = () => {
  const { notify } = useHub();
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [scale, setScale] = useState(1.5);
  const [pages, setPages] = useState<RenderedPdfPage[]>([]);
  const [progress, setProgress] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const convertPdf = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setPages([]);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const rendered: RenderedPdfPage[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(`Rendering page ${i} of ${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to export image'))), format, 0.92)
        );
        rendered.push({
          pageNum: i,
          url: URL.createObjectURL(blob),
          blob,
          width: canvas.width,
          height: canvas.height,
        });
      }

      setPages(rendered);
      setProgress('');
      notify(`Rendered ${rendered.length} PDF page(s)`);
    } catch (err) {
      setError(
        err instanceof Error
          ? `PDF rendering failed: ${err.message}`
          : 'Could not render this PDF file. Ensure it is not password-protected or corrupted.'
      );
      setProgress('');
    } finally {
      setBusy(false);
    }
  };

  const downloadZip = async () => {
    if (!pages.length || !file) return;
    const zip = new JSZip();
    const ext = format === 'image/png' ? 'png' : 'jpg';
    const base = stripExtension(file.name);
    pages.forEach((p) => zip.file(`${base}_page_${p.pageNum}.${ext}`, p.blob));
    downloadBlob(await zip.generateAsync({ type: 'blob' }), `${base}_images.zip`);
    notify('ZIP archive downloaded');
  };

  return (
    <div className="space-y-6">
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 bg-slate-50/70 dark:bg-slate-950/40">
        <Upload className="w-7 h-7 text-blue-600 dark:text-blue-400 mb-2" />
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {file ? `${file.name} (${formatBytes(file.size)})` : 'Select a PDF document to render into images'}
        </span>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setFile(f);
              setPages([]);
              setError('');
            }
          }}
          className="sr-only"
        />
      </label>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Image Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as 'image/jpeg' | 'image/png')} className="px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
            <option value="image/jpeg">JPG (.jpg)</option>
            <option value="image/png">PNG (.png)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Resolution Scale</label>
          <select value={scale} onChange={(e) => setScale(Number(e.target.value))} className="px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
            <option value={1}>1× (Standard screen)</option>
            <option value={1.5}>1.5× (Crisp)</option>
            <option value={2}>2× (High resolution)</option>
          </select>
        </div>
        <button type="button" disabled={!file || busy} onClick={convertPdf} className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
          {busy ? progress || 'Rendering...' : 'Convert PDF Pages'}
        </button>
        {pages.length > 1 && (
          <button type="button" onClick={downloadZip} className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg cursor-pointer">
            <Archive className="w-4 h-4" />
            <span>Download All ZIP</span>
          </button>
        )}
      </div>

      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {pages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((p) => (
            <div key={p.pageNum} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950">
              <img src={p.url} alt={`Page ${p.pageNum}`} className="w-full h-56 object-contain bg-white border-b border-slate-200 dark:border-slate-800" />
              <div className="p-3 flex items-center justify-between text-xs">
                <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                  Page {p.pageNum} · {formatBytes(p.blob.size)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    downloadBlob(
                      p.blob,
                      `${stripExtension(file?.name || 'document')}_page_${p.pageNum}.${format === 'image/png' ? 'png' : 'jpg'}`
                    )
                  }
                  className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. PDF MERGER
// ============================================================================
export const PdfMergerTool: React.FC = () => {
  const { notify } = useHub();
  const [items, setItems] = useState<{ file: File; pageCount: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const addFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setError('');
    const next: { file: File; pageCount: number }[] = [];
    for (const file of Array.from(fileList)) {
      if (file.type !== 'application/pdf') continue;
      try {
        const doc = await PDFDocument.load(await file.arrayBuffer());
        next.push({ file, pageCount: doc.getPageCount() });
      } catch {
        setError(`Could not read "${file.name}". Ensure it is a valid, unencrypted PDF.`);
      }
    }
    setItems((prev) => [...prev, ...next]);
  };

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    setItems(copy);
  };

  const merge = async () => {
    if (items.length < 2) {
      setError('Upload at least 2 PDF files to merge.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const merged = await PDFDocument.create();
      for (const item of items) {
        const src = await PDFDocument.load(await item.file.arrayBuffer());
        const copied = await merged.copyPages(src, src.getPageIndices());
        copied.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save();
      downloadBlob(pdfBytesToBlob(bytes), 'merged-document.pdf');
      notify(`Merged ${items.length} PDFs (${merged.getPageCount()} pages total)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF merge failed.');
    } finally {
      setBusy(false);
    }
  };

  const totalPages = items.reduce((sum, i) => sum + i.pageCount, 0);

  return (
    <div className="space-y-6">
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 bg-slate-50/70 dark:bg-slate-950/40">
        <Upload className="w-7 h-7 text-blue-600 dark:text-blue-400 mb-2" />
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          Select two or more PDF files to combine
        </span>
        <input type="file" accept="application/pdf" multiple onChange={(e) => addFiles(e.target.files)} className="sr-only" />
      </label>

      {items.length > 0 && (
        <ul className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl">
          {items.map((item, idx) => (
            <li key={`${item.file.name}_${idx}`} className="px-4 py-3 flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <span className="font-mono text-xs text-slate-400 mr-2">{idx + 1}.</span>
                <span className="font-medium truncate">{item.file.name}</span>
                <span className="ml-2 text-xs font-mono tabular-nums text-slate-500">
                  {item.pageCount} pg · {formatBytes(item.file.size)}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} aria-label="Move up" className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => move(idx, 1)} disabled={idx === items.length - 1} aria-label="Move down" className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30">
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} aria-label="Remove file" className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="button" disabled={items.length < 2 || busy} onClick={merge} className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
          {busy ? 'Merging...' : `Merge ${items.length} PDFs (${totalPages} pages)`}
        </button>
        {items.length > 0 && (
          <button type="button" onClick={() => setItems([])} className="px-4 py-2.5 text-sm font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer">
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 4. PDF SPLITTER & PAGE EXTRACTOR
// ============================================================================
export const PdfSplitterTool: React.FC = () => {
  const { notify } = useHub();
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [mode, setMode] = useState<'extract' | 'splitAll'>('extract');
  const [rangeText, setRangeText] = useState('1');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadFile = async (f: File | undefined) => {
    if (!f) return;
    setError('');
    try {
      const doc = await PDFDocument.load(await f.arrayBuffer());
      setFile(f);
      setTotalPages(doc.getPageCount());
      setRangeText(doc.getPageCount() > 1 ? `1-${Math.min(2, doc.getPageCount())}` : '1');
    } catch {
      setError('Failed to open PDF. Ensure it is not password-protected.');
    }
  };

  const runSplit = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const src = await PDFDocument.load(await file.arrayBuffer());
      const base = stripExtension(file.name);

      if (mode === 'extract') {
        const indices = parsePageRange(rangeText, src.getPageCount());
        if (!indices.length) throw new Error('Enter at least one valid page number.');
        const out = await PDFDocument.create();
        const copied = await out.copyPages(src, indices);
        copied.forEach((p) => out.addPage(p));
        const bytes = await out.save();
        downloadBlob(pdfBytesToBlob(bytes), `${base}_extracted.pdf`);
        notify(`Extracted ${indices.length} page(s)`);
      } else {
        const zip = new JSZip();
        for (let i = 0; i < src.getPageCount(); i++) {
          const single = await PDFDocument.create();
          const [p] = await single.copyPages(src, [i]);
          single.addPage(p);
          zip.file(`${base}_page_${i + 1}.pdf`, await single.save());
        }
        downloadBlob(await zip.generateAsync({ type: 'blob' }), `${base}_split_pages.zip`);
        notify(`Split into ${src.getPageCount()} individual PDFs`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF split failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 bg-slate-50/70 dark:bg-slate-950/40">
        <Upload className="w-7 h-7 text-blue-600 dark:text-blue-400 mb-2" />
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {file ? `${file.name} (${totalPages} pages)` : 'Select a PDF to split or extract pages'}
        </span>
        <input type="file" accept="application/pdf" onChange={(e) => loadFile(e.target.files?.[0])} className="sr-only" />
      </label>

      {file && (
        <div className="space-y-4">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-md">
            <button type="button" onClick={() => setMode('extract')} className={`flex-1 py-2 text-xs font-medium rounded-md ${mode === 'extract' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
              Extract Page Range
            </button>
            <button type="button" onClick={() => setMode('splitAll')} className={`flex-1 py-2 text-xs font-medium rounded-md ${mode === 'splitAll' ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
              Split All Pages (ZIP)
            </button>
          </div>

          {mode === 'extract' && (
            <div className="max-w-md">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Pages to Extract (1 to {totalPages}, e.g. 1-3, 5)
              </label>
              <input
                type="text"
                value={rangeText}
                onChange={(e) => setRangeText(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
          )}

          <button type="button" disabled={busy} onClick={runSplit} className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
            {busy ? 'Processing...' : mode === 'extract' ? 'Extract Selected Pages' : 'Split Into ZIP'}
          </button>
        </div>
      )}

      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

// ============================================================================
// 5. PDF PAGE ROTATOR & DELETER
// ============================================================================
export const PdfRotateDeleteTool: React.FC = () => {
  const { notify } = useHub();
  const [file, setFile] = useState<File | null>(null);
  const [pageStates, setPageStates] = useState<{ pageNum: number; rotation: number; deleted: boolean }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadPdf = async (f: File | undefined) => {
    if (!f) return;
    setError('');
    try {
      const doc = await PDFDocument.load(await f.arrayBuffer());
      setFile(f);
      setPageStates(
        Array.from({ length: doc.getPageCount() }, (_, i) => ({
          pageNum: i + 1,
          rotation: 0,
          deleted: false,
        }))
      );
    } catch {
      setError('Could not load PDF file.');
    }
  };

  const rotateAll = () => {
    setPageStates((prev) => prev.map((p) => ({ ...p, rotation: (p.rotation + 90) % 360 })));
  };

  const saveUpdated = async () => {
    if (!file) return;
    const kept = pageStates.filter((p) => !p.deleted);
    if (!kept.length) {
      setError('Cannot delete all pages—keep at least one page.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const src = await PDFDocument.load(await file.arrayBuffer());
      const out = await PDFDocument.create();
      for (const state of kept) {
        const [copied] = await out.copyPages(src, [state.pageNum - 1]);
        const currentAngle = copied.getRotation().angle;
        copied.setRotation(degrees((currentAngle + state.rotation) % 360));
        out.addPage(copied);
      }
      const bytes = await out.save();
      downloadBlob(pdfBytesToBlob(bytes), `${stripExtension(file.name)}_updated.pdf`);
      notify(`Saved updated PDF (${kept.length} pages)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update PDF.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 bg-slate-50/70 dark:bg-slate-950/40">
        <Upload className="w-7 h-7 text-blue-600 dark:text-blue-400 mb-2" />
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {file ? `${file.name} (${pageStates.length} pages)` : 'Select a PDF to rotate or delete pages'}
        </span>
        <input type="file" accept="application/pdf" onChange={(e) => loadPdf(e.target.files?.[0])} className="sr-only" />
      </label>

      {pageStates.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={rotateAll} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate All +90°</span>
            </button>
            <button type="button" disabled={busy} onClick={saveUpdated} className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
              {busy ? 'Saving...' : `Save Updated PDF (${pageStates.filter((p) => !p.deleted).length} pages)`}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {pageStates.map((p, idx) => (
              <div
                key={p.pageNum}
                className={`p-3 rounded-xl border text-center space-y-2 ${
                  p.deleted
                    ? 'border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 opacity-60'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50'
                }`}
              >
                <div className="font-mono text-sm font-semibold">Page {p.pageNum}</div>
                <div className="text-xs font-mono text-slate-500">+{p.rotation}°</div>
                <div className="flex justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setPageStates((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, rotation: (item.rotation + 90) % 360 } : item))
                      )
                    }
                    className="p-1.5 rounded border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPageStates((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, deleted: !item.deleted } : item))
                      )
                    }
                    className={`px-2 py-1 text-xs rounded border ${
                      p.deleted
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'text-red-600 border-red-300 dark:border-red-900'
                    }`}
                  >
                    {p.deleted ? 'Restore' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

// ============================================================================
// 6. PDF WATERMARK, PAGE NUMBERS, METADATA, TEXT EXTRACTOR & OPTIMIZER
// ============================================================================
export const PdfWatermarkTools: React.FC = () => {
  const { notify } = useHub();
  const [tab, setTab] = useState<'stamp' | 'inspect' | 'optimize'>('stamp');
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.22);
  const [addPageNums, setAddPageNums] = useState(true);
  const [metadata, setMetadata] = useState<Record<string, string> | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [optSummary, setOptSummary] = useState<{ before: number; after: number; blob: Blob } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setError('');
    setMetadata(null);
    setExtractedText('');
    setOptSummary(null);
  };

  const applyStamp = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      pages.forEach((page, idx) => {
        const { width, height } = page.getSize();
        if (watermarkText.trim()) {
          const fontSize = Math.min(54, Math.max(22, width / 12));
          const textWidth = font.widthOfTextAtSize(watermarkText.trim(), fontSize);
          page.drawText(watermarkText.trim(), {
            x: (width - textWidth * 0.7) / 2,
            y: height / 2 - fontSize / 2,
            size: fontSize,
            font,
            color: rgb(0.4, 0.45, 0.55),
            opacity: watermarkOpacity,
            rotate: degrees(35),
          });
        }
        if (addPageNums) {
          const label = `Page ${idx + 1} of ${pages.length}`;
          const tw = font.widthOfTextAtSize(label, 10);
          page.drawText(label, {
            x: (width - tw) / 2,
            y: 22,
            size: 10,
            font,
            color: rgb(0.35, 0.38, 0.44),
          });
        }
      });

      const bytes = await pdfDoc.save();
      downloadBlob(pdfBytesToBlob(bytes), `${stripExtension(file.name)}_stamped.pdf`);
      notify('Stamped PDF downloaded');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process PDF.');
    } finally {
      setBusy(false);
    }
  };

  const inspectAndExtract = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf.slice(0));
      setMetadata({
        'File Name': file.name,
        'File Size': formatBytes(file.size),
        'Page Count': String(doc.getPageCount()),
        Title: doc.getTitle() || '—',
        Author: doc.getAuthor() || '—',
        Subject: doc.getSubject() || '—',
        Creator: doc.getCreator() || '—',
        Producer: doc.getProducer() || '—',
      });

      const pdfjsDoc = await pdfjsLib.getDocument({ data: buf }).promise;
      const chunks: string[] = [];
      for (let i = 1; i <= pdfjsDoc.numPages; i++) {
        const page = await pdfjsDoc.getPage(i);
        const tc = await page.getTextContent();
        const pageStr = tc.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        chunks.push(`--- Page ${i} ---\n${pageStr || '(No selectable text on this page)'}`);
      }
      setExtractedText(chunks.join('\n\n'));
      notify('Metadata and text extracted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inspection failed.');
    } finally {
      setBusy(false);
    }
  };

  const runBrowserOptimize = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer());
      const outBytes = await doc.save({ useObjectStreams: true });
      const blob = pdfBytesToBlob(outBytes);
      setOptSummary({ before: file.size, after: blob.size, blob });
      notify('Structural browser optimization complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Optimization failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-xl">
        {[
          { id: 'stamp', label: 'Watermark & Page Numbers' },
          { id: 'inspect', label: 'Metadata & Text Extractor' },
          { id: 'optimize', label: 'PDF Structure Optimizer' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id as 'stamp' | 'inspect' | 'optimize')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              tab === item.id ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-7 text-center cursor-pointer hover:border-blue-500 bg-slate-50/70 dark:bg-slate-950/40">
        <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-1.5" />
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {file ? `${file.name} (${formatBytes(file.size)})` : 'Select a PDF document'}
        </span>
        <input type="file" accept="application/pdf" onChange={(e) => handleUpload(e.target.files?.[0])} className="sr-only" />
      </label>

      {tab === 'stamp' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Diagonal Watermark Text (leave blank to skip)
              </label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Opacity: <span className="font-mono">{Math.round(watermarkOpacity * 100)}%</span>
              </label>
              <input type="range" min={0.08} max={0.65} step={0.02} value={watermarkOpacity} onChange={(e) => setWatermarkOpacity(Number(e.target.value))} className="w-full accent-blue-600 mt-2" />
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" checked={addPageNums} onChange={(e) => setAddPageNums(e.target.checked)} className="accent-blue-600" />
            <span>Add bottom-center page numbers (“Page 1 of N”)</span>
          </label>
          <div>
            <button type="button" disabled={!file || busy} onClick={applyStamp} className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
              {busy ? 'Applying...' : 'Apply & Download PDF'}
            </button>
          </div>
        </div>
      )}

      {tab === 'inspect' && (
        <div className="space-y-4">
          <button type="button" disabled={!file || busy} onClick={inspectAndExtract} className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
            {busy ? 'Inspecting...' : 'Inspect Metadata & Extract Text'}
          </button>

          {metadata && (
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              {Object.entries(metadata).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="font-medium text-slate-900 dark:text-white mt-0.5 break-all">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {extractedText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Extracted Text</span>
                <button
                  type="button"
                  onClick={async () => {
                    if (await copyToClipboard(extractedText)) notify('Extracted text copied');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy All</span>
                </button>
              </div>
              <textarea
                readOnly
                rows={10}
                value={extractedText}
                className="w-full p-3.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
          )}
        </div>
      )}

      {tab === 'optimize' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <strong>Honest Browser Compression Note:</strong> Client-side PDF optimization repacks object streams and
            removes unused incremental revisions cleanly without degrading text quality. Already-compressed scanned
            PDFs may show minimal or zero size reduction in a browser without lossy image re-encoding.
          </p>
          <button type="button" disabled={!file || busy} onClick={runBrowserOptimize} className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
            {busy ? 'Optimizing...' : 'Run Browser Optimization'}
          </button>
          {optSummary && file && (
            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm font-mono tabular-nums">
                {formatBytes(optSummary.before)} → <strong>{formatBytes(optSummary.after)}</strong>{' '}
                ({optSummary.after < optSummary.before ? `-${Math.round(((optSummary.before - optSummary.after) / optSummary.before) * 100)}% saved` : 'Already tightly packed'})
              </div>
              <button
                type="button"
                onClick={() => downloadBlob(optSummary.blob, `${stripExtension(file.name)}_optimized.pdf`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};
