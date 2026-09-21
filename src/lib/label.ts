import { getSyncConfig } from './sync';

export interface LabelResult { productName: string | null; ingredients: string[]; allergenStatement: string | null }

/** Downscale a label photo on-device (labels are legible well under 1400 px) and send it as JPEG. */
export async function readLabelPhoto(file: File): Promise<LabelResult> {
  const cfg = await getSyncConfig();
  if (!cfg) throw new Error('Set the sync server and token in Settings first.');
  const dataUrl = await downscale(file, 1400, 0.82);
  const res = await fetch(`${cfg.apiBase}/label`, {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${cfg.token}` },
    body: JSON.stringify({ image: dataUrl.split(',')[1], mediaType: 'image/jpeg' }), signal: AbortSignal.timeout(90000),
  });
  const body = (await res.json().catch(() => ({}))) as Partial<LabelResult> & { error?: string };
  if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
  return { productName: body.productName ?? null, ingredients: body.ingredients ?? [], allergenStatement: body.allergenStatement ?? null };
}

function downscale(file: File, max: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image')); };
    img.src = url;
  });
}
