import React, { useEffect, useRef, useState } from 'react';
import { Copy, Download, Upload } from 'lucide-react';
import { useHub } from '../context/HubContext';
import { copyToClipboard, downloadBlob, loadImageElement, readFileAsDataUrl } from '../utils/download';

// ============================================================================
// 1. YOUTUBE THUMBNAIL & SOCIAL MEDIA IMAGE RESIZER
// ============================================================================
const SOCIAL_PRESETS = [
  { id: 'yt-thumb', label: 'YouTube Thumbnail (1280 × 720)', w: 1280, h: 720 },
  { id: 'ig-square', label: 'Instagram Square Post (1080 × 1080)', w: 1080, h: 1080 },
  { id: 'ig-portrait', label: 'Instagram Portrait Post (1080 × 1350)', w: 1080, h: 1350 },
  { id: 'ig-story', label: 'Instagram Story / Reels (1080 × 1920)', w: 1080, h: 1920 },
  { id: 'og-card', label: 'Open Graph / LinkedIn / FB (1200 × 630)', w: 1200, h: 630 },
  { id: 'x-header', label: 'X / Twitter Header (1500 × 500)', w: 1500, h: 500 },
];

export const SocialMediaResizerTool: React.FC = () => {
  const { notify } = useHub();
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [presetId, setPresetId] = useState('yt-thumb');
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
  const [bgColor, setBgColor] = useState('#0f172a');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const preset = SOCIAL_PRESETS.find((p) => p.id === presetId) || SOCIAL_PRESETS[0];

  useEffect(() => {
    if (!imgEl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = preset.w;
    canvas.height = preset.h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, preset.w, preset.h);

    const scale =
      fitMode === 'cover'
        ? Math.max(preset.w / imgEl.naturalWidth, preset.h / imgEl.naturalHeight)
        : Math.min(preset.w / imgEl.naturalWidth, preset.h / imgEl.naturalHeight);
    const dw = imgEl.naturalWidth * scale;
    const dh = imgEl.naturalHeight * scale;
    ctx.drawImage(imgEl, (preset.w - dw) / 2, (preset.h - dh) / 2, dw, dh);
  }, [imgEl, preset, fitMode, bgColor]);

  const exportImage = (mime: 'image/jpeg' | 'image/png') => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(
      (blob) => {
        if (!blob) return;
        downloadBlob(blob, `${preset.id}_${preset.w}x${preset.h}.${mime === 'image/png' ? 'png' : 'jpg'}`);
        notify(`Downloaded ${preset.w}×${preset.h} image`);
      },
      mime,
      0.92
    );
  };

  return (
    <div className="space-y-6">
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 bg-slate-50/70 dark:bg-slate-950/40">
        <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-1.5" />
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          Upload an image for YouTube, Instagram, X, or LinkedIn
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setImgEl(await loadImageElement(await readFileAsDataUrl(f)));
          }}
          className="sr-only"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1">
          <label className="block text-xs text-slate-500 mb-1">Platform Preset</label>
          <select value={presetId} onChange={(e) => setPresetId(e.target.value)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
            {SOCIAL_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Framing Mode</label>
          <select value={fitMode} onChange={(e) => setFitMode(e.target.value as 'cover' | 'contain')} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
            <option value="cover">Cover (Center Crop to Fill)</option>
            <option value="contain">Contain (Fit with Padding)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Padding Background</label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-full rounded border border-slate-300 dark:border-slate-700" />
        </div>
      </div>

      {imgEl && (
        <div className="space-y-4">
          <div className="flex justify-center p-4 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <canvas ref={canvasRef} className="max-h-96 max-w-full w-auto h-auto rounded shadow-xs" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => exportImage('image/jpeg')} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              <span>Download JPG ({preset.w}×{preset.h})</span>
            </button>
            <button type="button" onClick={() => exportImage('image/png')} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. HASHTAG GENERATOR, YOUTUBE TAG COUNTER & BIO/CAPTION HELPER
// ============================================================================
const NICHE_TAGS: Record<string, string[]> = {
  tech: ['technology', 'webdev', 'programming', 'coding', 'productivity', 'software', 'buildinpublic', 'techtools'],
  photography: ['photography', 'photooftheday', 'visualstorytelling', 'portrait', 'streetphotography', 'lightroom', 'camera'],
  education: ['studygram', 'learning', 'studentlife', 'studyhacks', 'productivitytips', 'examready', 'education'],
  business: ['entrepreneur', 'smallbusiness', 'freelance', 'marketingtips', 'digitalcreator', 'branding', 'workflow'],
  travel: ['travel', 'wanderlust', 'exploremore', 'travelphotography', 'cityscape', 'weekendvibes', 'adventure'],
};

export const HashtagCreatorTool: React.FC = () => {
  const { notify } = useHub();
  const [tab, setTab] = useState<'hashtags' | 'yt-tags' | 'bio'>('hashtags');
  const [topic, setTopic] = useState('web tools');
  const [niche, setNiche] = useState<keyof typeof NICHE_TAGS>('tech');
  const [ytTags, setYtTags] = useState('smart tools hub, image resizer, pdf merger, online calculator, browser tools');
  const [bioRole, setBioRole] = useState('Designer & Web Builder');
  const [bioFocus, setBioFocus] = useState('Sharing practical tutorials and free browser tools');
  const [bioCta, setBioCta] = useState('Explore resources below');

  const generatedHashtags = (() => {
    const cleanWords = topic
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const joined = cleanWords.join('');
    const custom = [
      ...(joined ? [`#${joined}`, `#${joined}tips`, `#${joined}guide`] : []),
      ...cleanWords.map((w) => `#${w}`),
    ];
    const base = NICHE_TAGS[niche].map((t) => `#${t}`);
    return Array.from(new Set([...custom, ...base])).join(' ');
  })();

  const parsedYtTags = ytTags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const ytCharCount = ytTags.length;

  const formattedBio = `${bioRole}\n${bioFocus}\n${bioCta}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-xl">
        {[
          { id: 'hashtags', label: 'Hashtag Builder' },
          { id: 'yt-tags', label: 'YouTube Tag Counter' },
          { id: 'bio', label: 'Bio & Caption Template' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id as 'hashtags' | 'yt-tags' | 'bio')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              tab === item.id ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'hashtags' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Topic / Keyword</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Niche Template</label>
              <select value={niche} onChange={(e) => setNiche(e.target.value as keyof typeof NICHE_TAGS)} className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg capitalize">
                {Object.keys(NICHE_TAGS).map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>
          <textarea readOnly rows={4} value={generatedHashtags} className="w-full p-3.5 text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Deterministic niche templates (no external AI API required)</span>
            <button
              type="button"
              onClick={async () => {
                if (await copyToClipboard(generatedHashtags)) notify('Hashtags copied');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Hashtags</span>
            </button>
          </div>
        </div>
      )}

      {tab === 'yt-tags' && (
        <div className="space-y-4">
          <textarea rows={5} value={ytTags} onChange={(e) => setYtTags(e.target.value)} placeholder="Comma-separated YouTube tags..." className="w-full p-3.5 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl" />
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono tabular-nums">
            <span className={ytCharCount > 500 ? 'text-red-600 font-semibold' : 'text-slate-600 dark:text-slate-400'}>
              {ytCharCount} / 500 YouTube characters · {parsedYtTags.length} tags
            </span>
            <button
              type="button"
              onClick={async () => {
                if (await copyToClipboard(parsedYtTags.join(', '))) notify('Cleaned tag list copied');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 font-sans font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Clean Tags</span>
            </button>
          </div>
        </div>
      )}

      {tab === 'bio' && (
        <div className="space-y-4 max-w-xl">
          <input type="text" value={bioRole} onChange={(e) => setBioRole(e.target.value)} placeholder="Role / Identity line" className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          <input type="text" value={bioFocus} onChange={(e) => setBioFocus(e.target.value)} placeholder="Value proposition line" className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          <input type="text" value={bioCta} onChange={(e) => setBioCta(e.target.value)} placeholder="Call to action" className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 whitespace-pre-wrap text-sm">
            {formattedBio}
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span className={formattedBio.length > 150 ? 'text-amber-600' : ''}>{formattedBio.length} / 150 Instagram bio chars</span>
            <button
              type="button"
              onClick={async () => {
                if (await copyToClipboard(formattedBio)) notify('Bio copied');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 font-sans font-medium bg-blue-600 text-white rounded-lg cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Bio</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. OPEN GRAPH & SOCIAL CARD PREVIEWER
// ============================================================================
export const OpenGraphPreviewTool: React.FC = () => {
  const { notify } = useHub();
  const [title, setTitle] = useState('Smart Tools Hub — Your Everyday Tools, All in One Place');
  const [desc, setDesc] = useState('46+ fast, privacy-first browser utilities across 10 practical categories—no sign-up required.');
  const [url, setUrl] = useState('https://example.com/smart-tools-hub');
  const [imagePreview, setImagePreview] = useState('');

  const hostname = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return 'example.com';
    }
  })();

  const metaTags = `<title>${title}</title>
<meta name="description" content="${desc}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${desc}" />`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-6 space-y-4">
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Page Title (ideal 30–60 chars)</span>
            <span className="font-mono">{title.length} chars</span>
          </div>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Meta Description (ideal 120–160 chars)</span>
            <span className="font-mono">{desc.length} chars</span>
          </div>
          <textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full p-3 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Canonical URL</label>
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-3.5 py-2 text-sm font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg" />
        </div>
        <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Local OG Image Preview (1200×630)</span>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) setImagePreview(await readFileAsDataUrl(f));
            }}
            className="sr-only"
          />
        </label>

        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Generated HTML Meta Tags</span>
            <button
              type="button"
              onClick={async () => {
                if (await copyToClipboard(metaTags)) notify('Meta tags copied');
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Snippet</span>
            </button>
          </div>
          <pre className="p-3.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
            {metaTags}
          </pre>
        </div>
      </div>

      <div className="lg:col-span-6 space-y-4">
        <div className="text-xs font-medium text-slate-500">Social Link Card Preview</div>
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
          {imagePreview ? (
            <img src={imagePreview} alt="Open Graph preview" className="w-full aspect-[1.91/1] object-cover" />
          ) : (
            <div className="w-full aspect-[1.91/1] bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center p-6 text-center text-white">
              <div>
                <div className="font-display text-xl font-bold">{title.slice(0, 48)}</div>
                <div className="text-xs opacity-85 mt-1">{hostname} · 1200 × 630 preview</div>
              </div>
            </div>
          )}
          <div className="p-4 space-y-1 bg-slate-50 dark:bg-slate-900">
            <div className="text-xs text-slate-500 uppercase">{hostname}</div>
            <div className="font-display text-base font-semibold text-slate-900 dark:text-white line-clamp-1">
              {title}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{desc}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
