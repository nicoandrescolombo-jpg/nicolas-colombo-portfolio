'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { getVideoEmbedUrl, getVideoThumbnail } from '@/lib/utils/helpers';

interface VideoEmbedProps {
  url: string;
  mediaType: 'youtube' | 'vimeo';
  title?: string;
  /** Portada propia del proyecto: se ve mejor que la miniatura automática */
  posterUrl?: string | null;
}

export default function VideoEmbed({ url, title = 'Video', posterUrl }: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const embedSrc = getVideoEmbedUrl(url, { autoplay: true });
  const thumbnailSrc = posterUrl || getVideoThumbnail(url);

  if (!embedSrc) {
    return (
      <div className="video-embed-wrapper flex items-center justify-center">
        <p className="type-body italic text-lead">This video link can’t be played here.</p>
      </div>
    );
  }

  if (isPlaying) {
    return (
      <div className="video-embed-wrapper">
        <iframe
          src={embedSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsPlaying(true)}
      aria-label={`Play ${title}`}
      className="video-embed-wrapper group block w-full text-left cursor-pointer"
    >
      {thumbnailSrc && (
        <Image
          src={thumbnailSrc}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.015]"
          unoptimized={thumbnailSrc.includes('vumbnail.com') || thumbnailSrc.includes('img.youtube.com')}
          priority
        />
      )}

      <span className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors duration-300" aria-hidden="true" />

      <span className="absolute left-5 bottom-5 sm:left-8 sm:bottom-8 btn-paper pointer-events-none">
        <Play size={16} fill="currentColor" strokeWidth={0} aria-hidden="true" />
        Play
      </span>
    </button>
  );
}
