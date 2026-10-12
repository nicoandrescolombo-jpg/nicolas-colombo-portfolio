'use client';

import { useState } from 'react';
import Image from 'next/image';

interface VideoEmbedProps {
  url: string;
  mediaType: 'youtube' | 'vimeo';
  title?: string;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

export default function VideoEmbed({ url, mediaType, title = 'Video' }: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const youtubeId = mediaType === 'youtube' ? extractYouTubeId(url) : null;
  const vimeoId = mediaType === 'vimeo' ? extractVimeoId(url) : null;

  const thumbnailSrc =
    mediaType === 'youtube' && youtubeId
      ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
      : null;

  const embedSrc =
    mediaType === 'youtube' && youtubeId
      ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`
      : mediaType === 'vimeo' && vimeoId
      ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1`
      : null;

  if (!embedSrc) {
    return (
      <div className="video-embed-wrapper bg-[#1A1A1A] flex items-center justify-center aspect-video rounded-sm">
        <p className="text-[#999999] font-ui text-sm">Invalid video URL</p>
      </div>
    );
  }

  if (isPlaying) {
    return (
      <div className="video-embed-wrapper aspect-video w-full rounded-sm overflow-hidden">
        <iframe
          src={embedSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  return (
    <div className="video-embed-wrapper aspect-video w-full relative rounded-sm overflow-hidden group cursor-pointer bg-[#0A0A0A]">
      {/* Thumbnail */}
      {thumbnailSrc ? (
        <Image
          src={thumbnailSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          unoptimized
        />
      ) : (
        /* Vimeo has no free thumbnail API — show a branded placeholder */
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] flex items-center justify-center">
          <span className="font-display italic text-[#333333] text-2xl select-none">Vimeo</span>
        </div>
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />

      {/* Play button */}
      <button
        onClick={() => setIsPlaying(true)}
        aria-label={`Play ${title}`}
        className="absolute inset-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8FF59] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <span className="flex items-center justify-center w-16 h-16 rounded-full bg-black/60 border border-white/20 backdrop-blur-sm transition-all duration-300 group-hover:bg-[#E8FF59]/90 group-hover:border-[#E8FF59] group-hover:scale-110 shadow-lg">
          {/* Triangle play icon */}
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-white group-hover:text-black translate-x-0.5 transition-colors duration-300"
            aria-hidden="true"
          >
            <path d="M8 5.14v14l11-7-11-7z" />
          </svg>
        </span>
      </button>
    </div>
  );
}
