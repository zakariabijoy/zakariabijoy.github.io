import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

export const MEDIA_BUCKET = 'portfolio-media';

const IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]);

const PDF_MIME = 'application/pdf';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

export type MediaKind = 'image' | 'pdf';

export interface MediaUploadResult {
  path: string;
  publicUrl: string;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  validate(file: File, kind: MediaKind): string | null {
    if (kind === 'pdf') {
      if (file.type !== PDF_MIME && !file.name.toLowerCase().endsWith('.pdf')) {
        return 'Only PDF files are allowed.';
      }
      if (file.size > MAX_PDF_BYTES) {
        return 'PDF must be 10 MB or smaller.';
      }
      return null;
    }

    if (!IMAGE_MIME.has(file.type)) {
      return 'Use JPEG, PNG, WebP, or SVG images.';
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return 'Image must be 5 MB or smaller.';
    }
    return null;
  }

  getPublicUrl(path: string): string {
    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  /** Returns the storage object path if the URL belongs to this bucket. */
  pathFromPublicUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(url.slice(idx + marker.length));
  }

  async upload(path: string, file: File, kind: MediaKind): Promise<MediaUploadResult> {
    const error = this.validate(file, kind);
    if (error) throw new Error(error);

    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type || undefined });

    if (uploadError) throw new Error(uploadError.message);

    return { path, publicUrl: this.getPublicUrl(path) };
  }

  async remove(paths: string[]): Promise<void> {
    const unique = [...new Set(paths.filter(Boolean))];
    if (!unique.length) return;

    const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(unique);
    if (error) throw new Error(error.message);
  }

  /** Unique object name under a folder, preserving the file extension. */
  buildPath(folder: string, file: File): string {
    const ext = this.extension(file);
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    return `${cleanFolder}/${stamp}${ext}`;
  }

  private extension(file: File): string {
    const fromName = file.name.includes('.')
      ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
      : '';
    if (fromName && fromName.length <= 8) return fromName;

    switch (file.type) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      case 'image/svg+xml':
        return '.svg';
      case 'application/pdf':
        return '.pdf';
      default:
        return '';
    }
  }
}
