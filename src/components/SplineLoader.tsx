'use client';

import { useState } from 'react';
import Spline from '@splinetool/react-spline';

export default function SplineLoader() {
  const [url, setUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [useIframe, setUseIframe] = useState(false);

  const handleLoad = () => {
    if (url.trim()) {
      setIsLoading(true);
      setError('');
      setActiveUrl(url.trim());
      // Use iframe for my.spline.design URLs
      setUseIframe(url.includes('my.spline.design'));
    }
  };

  const handleSplineLoad = () => {
    setIsLoading(false);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLoad();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Spline Viewer</h1>
        
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste a Spline URL (my.spline.design or .splinecode)..."
            className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg 
                       focus:outline-none focus:border-zinc-500 text-white placeholder-zinc-500"
          />
          <button
            onClick={handleLoad}
            disabled={!url.trim()}
            className="px-6 py-3 bg-white text-black font-medium rounded-lg
                       hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            Load
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {activeUrl && (
          <div className="relative bg-zinc-800 rounded-xl overflow-hidden" style={{ height: '600px' }}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 z-10">
                <div className="text-zinc-400">Loading...</div>
              </div>
            )}
            {useIframe ? (
              <iframe
                src={activeUrl}
                onLoad={handleIframeLoad}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; xr-spatial-tracking"
              />
            ) : (
              <Spline
                scene={activeUrl}
                onLoad={handleSplineLoad}
              />
            )}
          </div>
        )}

        {!activeUrl && (
          <div className="flex items-center justify-center h-96 bg-zinc-800 rounded-xl border border-zinc-700 border-dashed">
            <p className="text-zinc-500">Enter a Spline URL above to preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
