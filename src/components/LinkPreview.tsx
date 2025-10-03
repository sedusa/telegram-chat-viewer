import React, { useEffect, useState, useRef } from 'react';
import { parseLink, openUrl } from '../utils/linkParser';
import { getLinkMetadata } from '../utils/linkMetadataCache';
import { ImageIcon } from 'lucide-react';

interface LinkPreviewProps {
  url: string;
}

interface LinkMetadata {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

const LinkPreviewComponent: React.FC<LinkPreviewProps> = ({ url }) => {
  const parsed = parseLink(url);
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        rootMargin: '200px', // Start loading when element is 200px from viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Fetch metadata only when visible
  useEffect(() => {
    if (!isVisible) return;

    const fetchMetadata = async () => {
      try {
        const meta = await getLinkMetadata(url, parsed.domain);
        setMetadata(meta);
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
      }
    };

    fetchMetadata();
  }, [isVisible, url, parsed.domain]);

  const handleClick = () => {
    openUrl(url);
  };

  // Extract a clean title from the URL
  const getTitle = () => {
    if (metadata?.title) return metadata.title;
    
    // If there's a path, use the last segment as title
    if (parsed.path && parsed.path !== '/') {
      const segments = parsed.path.split('/').filter(s => s);
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1];
        // Remove file extensions and decode URL encoding
        return decodeURIComponent(lastSegment.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
    return parsed.domain;
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="cursor-pointer bg-white dark:bg-gray-700/50 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      {/* Image preview */}
      {metadata?.image && !imageError && (
        <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-800 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400 animate-pulse" />
            </div>
          )}
          <img
            src={metadata.image}
            alt={metadata.title || 'Link preview'}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        </div>
      )}

      <div className="p-3 space-y-2">
        {/* Domain/Site name */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-500 dark:bg-blue-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {(metadata?.siteName || parsed.domain).charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
            {metadata?.siteName || parsed.domain}
          </span>
        </div>
        
        {/* Title/Page name */}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
          {getTitle()}
        </h3>
        
        {/* Description */}
        {metadata?.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {metadata.description}
          </p>
        )}
        
        {/* URL preview */}
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {url}
        </p>
      </div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders when URL hasn't changed
export const LinkPreview = React.memo(LinkPreviewComponent, (prevProps, nextProps) => {
  return prevProps.url === nextProps.url;
});

