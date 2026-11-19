import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import JsBarcode from 'jsbarcode';
import { Camera, Copy, Download, ShieldAlert, StopCircle, Upload } from 'lucide-react';
import { useHub } from '../context/HubContext';
import { copyToClipboard, downloadDataUrl, downloadText, loadImageElement, readFileAsDataUrl } from '../utils/download';

// ============================================================================
// 1. MULTI-TYPE QR CODE GENERATOR (URL, Wi-Fi, Text, Email, Phone, Contact)
// ============================================================================
type QrKind = 'url' | 'wifi' | 'text' | 'email' | 'phone' | 'contact';

export const QrGeneratorTool: React.FC = () => {
  const { notify } = useHub();
  const [kind, setKind] = useState<QrKind>('url');
  const [url, setUrl] = useState('https://example.com');
  const [text, setText] = useState('Hello from Smart Tools Hub');
  const [wifiSsid, setWifiSsid] = useState('MyHomeWiFi');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiEnc, setWifiEnc] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [emailTo, setEmailTo] = useState('hello@example.com');
  const [emailSubject, setEmailSubject] = useState('Inquiry');
  const [phone, setPhone] = useState('+1234567890');
  const [contactName, setContactName] = useState('Alex Rivera');
  const [contactPhone, setContactPhone] = useState('+1234567890');
  const [contactEmail, setContactEmail] = useState('alex@example.com');

  const [size, setSize] = useState(280);
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [ecc, setEcc] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [pngUrl, setPngUrl] = useState('');
  const [svgMarkup, setSvgMarkup] = useState('');
  const [error, setError] = useState('');

  const payload = (() => {
    switch (kind) {
      case 'url':
        return url.trim();
      case 'text':
        return text.trim();
      case 'wifi':
        return wifiSsid.trim()
          ? `WIFI:T:${wifiEnc};S:${wifiSsid.trim()};P:${wifiPass};;`
          : '';
      case 'email':
        return emailTo.trim()
          ? `mailto:${emailTo.trim()}?subject=${encodeURIComponent(emailSubject)}`
          : '';
      case 'phone':
        return phone.trim() ? `tel:${phone.trim()}` : '';
      case 'contact':
        return contactName.trim()
          ? `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName.trim()}\nTEL:${contactPhone.trim()}\nEMAIL:${contactEmail.trim()}\nEND:VCARD`
          : '';
    }
  })();

  useEffect(() => {
    if (!payload) {
      setPngUrl('');
      setSvgMarkup('');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const opts = {
          width: size,
          margin: 2,
          errorCorrectionLevel: ecc,
          color: { dark: fgColor, light: bgColor },
        };
        const [dataUrl, svg] = await Promise.all([
          QRCode.toDataURL(payload, opts),
          QRCode.toString(payload, { ...opts, type: 'svg' }),
        ]);
        if (!cancelled) {
          setPngUrl(dataUrl);
          setSvgMarkup(svg);
          setError('');
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to generate QR code.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [payload, size, fgColor, bgColor, ecc]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 space-y-5">
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {(
            [
              { id: 'url', label: 'URL' },
              { id: 'wifi', label: 'Wi-Fi' },
              { id: 'text', label: 'Text' },
              { id: 'email', label: 'Email' },
              { id: 'phone', label: 'Phone' },
              { id: 'contact', label: 'Contact' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setKind(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                kind === item.id ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {kind === 'url' && (
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Website URL</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          </div>
        )}

        {kind === 'text' && (
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Plain Text</label>
            <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          </div>
        )}

        {kind === 'wifi' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Network Name (SSID)</label>
              <input type="text" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Password</label>
              <input type="text" value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Security</label>
              <select value={wifiEnc} onChange={(e) => setWifiEnc(e.target.value as 'WPA' | 'WEP' | 'nopass')} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None (Open)</option>
              </select>
            </div>
          </div>
        )}

        {kind === 'email' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Recipient Email</label>
              <input type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Subject</label>
              <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </div>
          </div>
        )}

        {kind === 'phone' && (
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          </div>
        )}

        {kind === 'contact' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
              <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Phone</label>
              <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Size ({size}px)</label>
            <input type="range" min={160} max={640} step={20} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-blue-600 mt-2" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Foreground</label>
            <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="h-9 w-full rounded border border-slate-300 dark:border-slate-700" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Background</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-full rounded border border-slate-300 dark:border-slate-700" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Error Correction</label>
            <select value={ecc} onChange={(e) => setEcc(e.target.value as 'L' | 'M' | 'Q' | 'H')} className="w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>
        </div>
        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>

      <div className="lg:col-span-5 flex flex-col items-center p-6 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
        {pngUrl ? (
          <>
            <img src={pngUrl} alt="Generated QR code" className="max-w-[260px] w-full h-auto rounded-lg border border-slate-200 dark:border-slate-800" />
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  downloadDataUrl(pngUrl, `qr-${kind}.png`);
                  notify('QR PNG downloaded');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadText(svgMarkup, `qr-${kind}.svg`, 'image/svg+xml');
                  notify('QR SVG downloaded');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download SVG</span>
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500 py-16">Enter content to generate a QR code.</p>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 2. QR CODE SCANNER (IMAGE UPLOAD + HTTPS CAMERA FALLBACK)
// ============================================================================
export const QrScannerTool: React.FC = () => {
  const { notify } = useHub();
  const [decoded, setDecoded] = useState('');
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  useEffect(() => () => stopCamera(), []);

  const decodeImageFile = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    setDecoded('');
    try {
      const img = await loadImageElement(await readFileAsDataUrl(file));
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (!code) {
        setError('No readable QR code found in this image. Try a sharper, higher-contrast photo.');
      } else {
        setDecoded(code.data);
        notify('QR code decoded');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan image.');
    }
  };

  const startCamera = async () => {
    setError('');
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError('Camera scanning requires a secure HTTPS browser context with camera permission. Please use image upload below.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
        const scanFrame = () => {
          if (!videoRef.current || !streamRef.current) return;
          if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0);
              const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const found = jsQR(imgData.data, imgData.width, imgData.height);
              if (found) {
                setDecoded(found.data);
                notify('QR code scanned from camera');
                stopCamera();
                return;
              }
            }
          }
          rafRef.current = requestAnimationFrame(scanFrame);
        };
        rafRef.current = requestAnimationFrame(scanFrame);
      }, 60);
    } catch {
      setError('Camera permission was denied or no camera was detected. Use image upload as a reliable fallback.');
      stopCamera();
    }
  };

  const isUrl = /^https?:\/\//i.test(decoded);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-7 text-center cursor-pointer hover:border-blue-500 bg-slate-50/70 dark:bg-slate-950/40">
          <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
          <span className="text-sm font-medium text-slate-900 dark:text-white">Scan QR from Image File</span>
          <span className="text-xs text-slate-500 mt-1">Works offline in every browser</span>
          <input type="file" accept="image/*" onChange={(e) => decodeImageFile(e.target.files?.[0])} className="sr-only" />
        </label>

        <div className="flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 rounded-xl p-7 text-center bg-slate-50/70 dark:bg-slate-950/40 space-y-3">
          {!cameraActive ? (
            <>
              <Camera className="w-6 h-6 text-slate-600 dark:text-slate-300" />
              <div className="text-sm font-medium text-slate-900 dark:text-white">Live Camera Scanner</div>
              <p className="text-xs text-slate-500 max-w-xs">
                Requires HTTPS and browser camera permission. Video frames stay local in your browser.
              </p>
              <button type="button" onClick={startCamera} className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer">
                Start Camera Scan
              </button>
            </>
          ) : (
            <div className="w-full space-y-3">
              <video ref={videoRef} playsInline muted className="w-full max-h-56 rounded-lg bg-black object-cover" />
              <button type="button" onClick={stopCamera} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-red-600 text-white rounded-lg cursor-pointer">
                <StopCircle className="w-3.5 h-3.5" />
                <span>Stop Camera</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {decoded && (
        <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-3">
          <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Decoded QR Content</div>
          <pre className="p-3 rounded-lg bg-white dark:bg-slate-950 border border-emerald-200 dark:border-emerald-900 text-sm font-mono break-all whitespace-pre-wrap">
            {decoded}
          </pre>
          <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Safety notice: Verify unknown QR destinations carefully before visiting any link or entering credentials.</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                if (await copyToClipboard(decoded)) notify('Decoded text copied');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-emerald-700 text-white rounded-lg cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Content</span>
            </button>
            {isUrl && (
              <a
                href={decoded}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3.5 py-2 text-xs font-medium border border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-lg"
              >
                Open Link in New Tab
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. BARCODE GENERATOR (JsBarcode)
// ============================================================================
export const BarcodeGeneratorTool: React.FC = () => {
  const { notify } = useHub();
  const [format, setFormat] = useState<'CODE128' | 'EAN13' | 'UPC' | 'CODE39' | 'ITF14'>('CODE128');
  const [value, setValue] = useState('STH-2026-0046');
  const [lineWidth, setLineWidth] = useState(2);
  const [height, setHeight] = useState(90);
  const [showText, setShowText] = useState(true);
  const [error, setError] = useState('');
  const svgRef = useRef<SVGSVGElement | null>(null);

  const sampleForFormat = (fmt: typeof format) => {
    switch (fmt) {
      case 'EAN13':
        return '590123412345';
      case 'UPC':
        return '123456789012';
      case 'ITF14':
        return '10012345000017';
      case 'CODE39':
        return 'SMART-2026';
      default:
        return 'STH-2026-0046';
    }
  };

  useEffect(() => {
    if (!svgRef.current) return;
    try {
      JsBarcode(svgRef.current, value.trim() || ' ', {
        format,
        width: lineWidth,
        height,
        displayValue: showText,
        background: '#ffffff',
        lineColor: '#0f172a',
        margin: 12,
      });
      setError('');
    } catch {
      setError(`Invalid input for ${format}. Example valid code: ${sampleForFormat(format)}`);
    }
  }, [format, value, lineWidth, height, showText]);

  const downloadSvg = () => {
    if (!svgRef.current || error) return;
    const xml = new XMLSerializer().serializeToString(svgRef.current);
    downloadText(xml, `barcode-${format}.svg`, 'image/svg+xml');
    notify('Barcode SVG downloaded');
  };

  const downloadPng = () => {
    if (!svgRef.current || error) return;
    const xml = new XMLSerializer().serializeToString(svgRef.current);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      downloadDataUrl(canvas.toDataURL('image/png'), `barcode-${format}.png`);
      notify('Barcode PNG downloaded');
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(xml)))}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Barcode Format</label>
          <select
            value={format}
            onChange={(e) => {
              const next = e.target.value as typeof format;
              setFormat(next);
              setValue(sampleForFormat(next));
            }}
            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
          >
            <option value="CODE128">CODE128 (General ASCII)</option>
            <option value="EAN13">EAN-13 (12–13 digits)</option>
            <option value="UPC">UPC-A (12 digits)</option>
            <option value="CODE39">CODE39 (Alphanumeric)</option>
            <option value="ITF14">ITF-14 (14 digits)</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Barcode Value</label>
          <input type="text" value={value} onChange={(e) => setValue(e.target.value)} className="w-full px-3.5 py-2.5 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <label className="text-xs text-slate-600 dark:text-slate-400">
          Bar Width ({lineWidth}px)
          <input type="range" min={1} max={4} step={0.5} value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full accent-blue-600" />
        </label>
        <label className="text-xs text-slate-600 dark:text-slate-400">
          Bar Height ({height}px)
          <input type="range" min={40} max={160} step={5} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full accent-blue-600" />
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
          <input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} className="accent-blue-600" />
          <span>Show human-readable text</span>
        </label>
      </div>

      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="p-6 rounded-xl bg-white border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-4 overflow-x-auto">
        <svg ref={svgRef} className={error ? 'opacity-20' : ''} />
        <div className="flex gap-2">
          <button type="button" disabled={Boolean(error)} onClick={downloadPng} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg disabled:opacity-50 cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
          <button type="button" disabled={Boolean(error)} onClick={downloadSvg} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-slate-300 text-slate-800 rounded-lg disabled:opacity-50 cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            <span>Download SVG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
