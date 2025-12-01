'use client';

import { useState, useCallback, useRef } from 'react';
import Spline from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';

interface LoadMetrics {
  startTime: number;
  firstContentfulPaint: number | null;
  fullyLoaded: number | null;
  totalTime: number | null;
}

export default function SplineLoader() {
  const [sceneUrl, setSceneUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<LoadMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [splineApp, setSplineApp] = useState<Application | null>(null);
  
  const startTimeRef = useRef<number>(0);
  const loadHistoryRef = useRef<Array<{ url: string; metrics: LoadMetrics; timestamp: Date }>>([]);
  const [loadHistory, setLoadHistory] = useState<typeof loadHistoryRef.current>([]);

  const handleLoad = useCallback(() => {
    if (!sceneUrl.trim()) {
      setError('Please enter a Spline scene URL');
      return;
    }

    // Reset state
    setError(null);
    setIsLoading(true);
    setMetrics(null);
    setSplineApp(null);
    
    // Record start time
    startTimeRef.current = performance.now();
    setMetrics({
      startTime: startTimeRef.current,
      firstContentfulPaint: null,
      fullyLoaded: null,
      totalTime: null,
    });

    // Set the active URL to trigger the Spline component
    setActiveUrl(sceneUrl.trim());
  }, [sceneUrl]);

  const onSplineLoad = useCallback((spline: Application) => {
    const loadedTime = performance.now();
    const totalTime = loadedTime - startTimeRef.current;
    
    setSplineApp(spline);
    setIsLoading(false);
    
    const finalMetrics: LoadMetrics = {
      startTime: startTimeRef.current,
      firstContentfulPaint: totalTime * 0.3, // Estimate - actual FCP would need observer
      fullyLoaded: loadedTime,
      totalTime: totalTime,
    };
    
    setMetrics(finalMetrics);
    
    // Add to history
    const historyEntry = {
      url: activeUrl,
      metrics: finalMetrics,
      timestamp: new Date(),
    };
    loadHistoryRef.current = [historyEntry, ...loadHistoryRef.current.slice(0, 9)];
    setLoadHistory([...loadHistoryRef.current]);
  }, [activeUrl]);

  const formatTime = (ms: number | null) => {
    if (ms === null) return '—';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getSpeedRating = (ms: number | null) => {
    if (ms === null) return { label: '—', color: 'text-gray-400' };
    if (ms < 1000) return { label: 'Fast', color: 'text-green-500' };
    if (ms < 3000) return { label: 'Moderate', color: 'text-yellow-500' };
    if (ms < 5000) return { label: 'Slow', color: 'text-orange-500' };
    return { label: 'Very Slow', color: 'text-red-500' };
  };

  const clearScene = () => {
    setActiveUrl('');
    setMetrics(null);
    setSplineApp(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">Spline Scene Load Tester</h1>
          <p className="text-gray-400 text-sm mt-1">Measure loading performance of Spline 3D scenes</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* URL Input */}
        <div className="bg-gray-900 rounded-xl p-4 mb-6">
          <label className="block text-sm text-gray-400 mb-2">Spline Scene URL</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={sceneUrl}
              onChange={(e) => setSceneUrl(e.target.value)}
              placeholder="https://prod.spline.design/xxx/scene.splinecode"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
            />
            <button
              onClick={handleLoad}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Loading...' : 'Load Scene'}
            </button>
            {activeUrl && (
              <button
                onClick={clearScene}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          {error && (
            <p className="mt-2 text-red-400 text-sm">{error}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scene Viewport */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="border-b border-gray-800 px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-400">Scene Preview</span>
                {isLoading && (
                  <span className="flex items-center gap-2 text-sm text-blue-400">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading scene...
                  </span>
                )}
              </div>
              <div className="aspect-video bg-gray-950 relative">
                {activeUrl ? (
                  <Spline
                    scene={activeUrl}
                    onLoad={onSplineLoad}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <p>Enter a Spline scene URL to begin</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metrics Panel */}
          <div className="space-y-6">
            {/* Current Metrics */}
            <div className="bg-gray-900 rounded-xl p-4">
              <h2 className="text-sm font-medium text-gray-400 mb-4">Load Metrics</h2>
              
              {metrics ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Load Time</span>
                    <span className="text-2xl font-mono font-bold">
                      {formatTime(metrics.totalTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Speed Rating</span>
                    <span className={`font-semibold ${getSpeedRating(metrics.totalTime).color}`}>
                      {getSpeedRating(metrics.totalTime).label}
                    </span>
                  </div>

                  <div className="border-t border-gray-800 pt-4 mt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Status</p>
                        <p className={isLoading ? 'text-yellow-400' : 'text-green-400'}>
                          {isLoading ? 'Loading' : 'Loaded'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Scene Ready</p>
                        <p>{splineApp ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <p>No metrics yet</p>
                  <p className="text-sm mt-1">Load a scene to see timing data</p>
                </div>
              )}
            </div>

            {/* Load History */}
            <div className="bg-gray-900 rounded-xl p-4">
              <h2 className="text-sm font-medium text-gray-400 mb-4">Load History</h2>
              
              {loadHistory.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {loadHistory.map((entry, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-sm truncate max-w-[150px]" title={entry.url}>
                          {entry.url.split('/').slice(-2).join('/')}
                        </span>
                        <span className={`font-semibold ${getSpeedRating(entry.metrics.totalTime).color}`}>
                          {formatTime(entry.metrics.totalTime)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {entry.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-600 text-sm">
                  No history yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-gray-900/50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Tips for faster loading</h3>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Reduce polygon count and texture sizes in your Spline scene</li>
            <li>• Use compressed textures where possible</li>
            <li>• Remove unused objects and materials</li>
            <li>• Consider lazy loading for below-the-fold content</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
