'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, ExternalLink } from 'lucide-react';

interface YouTubeCardProps {
  videoId: string;
}

interface VideoData {
  title: string;
  thumbnail: string;
  channelTitle: string;
  duration?: string;
}

export default function YouTubeCard({ videoId }: YouTubeCardProps) {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Since we don't have YouTube API access, we'll use the default thumbnail and basic info
    const fetchVideoData = async () => {
      try {
        // Using YouTube's thumbnail API which doesn't require authentication
        const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        
        setVideoData({
          title: 'YouTube Video',
          thumbnail,
          channelTitle: 'YouTube',
          duration: ''
        });
      } catch (error) {
        console.error('Error fetching video data:', error);
        setVideoData({
          title: 'YouTube Video',
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          channelTitle: 'YouTube',
          duration: ''
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [videoId]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Fallback to smaller thumbnail if maxres fails
    e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  if (loading) {
    return (
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden shadow-lg">
        <div className="aspect-video bg-gray-200 animate-pulse" />
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
        </div>
      </div>
    );
  }

  if (!videoData) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md bg-white/90 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 group cursor-pointer"
    >
      {/* Thumbnail Section */}
      <div className="relative aspect-video bg-gray-200">
        <img
          src={videoData.thumbnail}
          alt={videoData.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={handleImageError}
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-300 hover:scale-125 hover:bg-white/30">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
        
        {/* Duration Badge */}
        {videoData.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {videoData.duration}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-gray-900 font-medium text-sm line-clamp-2 mb-2 transition-colors duration-300 group-hover:text-blue-600">
          {videoData.title}
        </h3>
        
        <p className="text-gray-500 text-xs mb-3">
          {videoData.channelTitle}
        </p>
        
        {/* Action Button */}
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 w-full justify-center hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
        >
          <ExternalLink className="w-4 h-4" />
          Watch on YouTube
        </a>
      </div>
    </motion.div>
  );
}

// Helper function to extract video ID from YouTube URLs
export function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}