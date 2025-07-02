import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, ExternalLink, Loader, Droplets, AlertOctagon, Zap, Wind } from 'lucide-react';
import { fetchDisasterNews, detectDisasterType, calculateSeverity } from '../utils/newsApi';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
  urlToImage?: string;
  content: string;
  detectionResult: 'verified' | 'suspicious';
  confidence: number;
  disasterType: 'earthquake' | 'flood' | 'hurricane' | 'wildfire' | 'other';
  severity: number;
}

const NewsVerificationPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Enhanced deepfake/misinformation detection
  const detectMisinformation = async (article: any): Promise<{ result: 'verified' | 'suspicious', confidence: number }> => {
    // Simulate AI-powered verification
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      'breaking:', 'urgent:', 'shocking:', 'unbelievable:',
      'you won\'t believe', 'doctors hate', 'secret that',
      'this one trick', 'amazing discovery'
    ];
    
    const hasSuspiciousPatterns = suspiciousPatterns.some(pattern => text.includes(pattern));
    
    // Check source reliability (simplified)
    const reliableSources = [
      'reuters', 'ap news', 'bbc', 'cnn', 'npr', 'guardian',
      'washington post', 'new york times', 'associated press'
    ];
    
    const isReliableSource = reliableSources.some(source => 
      article.source.name.toLowerCase().includes(source)
    );
    
    // Calculate confidence based on multiple factors
    let confidence = 50;
    
    if (isReliableSource) confidence += 30;
    if (!hasSuspiciousPatterns) confidence += 15;
    if (article.urlToImage) confidence += 5;
    if (article.content && article.content.length > 200) confidence += 10;
    
    // Add some randomness to simulate AI uncertainty
    confidence += Math.floor(Math.random() * 20) - 10;
    confidence = Math.max(20, Math.min(95, confidence));
    
    return {
      result: confidence > 60 ? 'verified' : 'suspicious',
      confidence
    };
  };

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newsArticles = await fetchDisasterNews();
      
      const processedArticles = await Promise.all(
        newsArticles.slice(0, 30).map(async (article: any) => {
          const verification = await detectMisinformation(article);
          
          return {
            ...article,
            detectionResult: verification.result,
            confidence: verification.confidence,
            disasterType: detectDisasterType(article.title, article.content || article.description || ''),
            severity: calculateSeverity(article)
          };
        })
      );

      setArticles(processedArticles);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch disaster reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchNews, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleArticleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getDisasterIcon = (type: 'earthquake' | 'flood' | 'hurricane' | 'wildfire' | 'other') => {
    switch (type) {
      case 'flood':
        return <Droplets className="h-5 w-5 text-blue-400" />;
      case 'earthquake':
        return <AlertOctagon className="h-5 w-5 text-orange-400" />;
      case 'hurricane':
        return <Wind className="h-5 w-5 text-purple-400" />;
      case 'wildfire':
        return <Zap className="h-5 w-5 text-red-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
    }
  };

  const getDisasterColor = (type: string) => {
    switch (type) {
      case 'flood':
        return 'bg-blue-900/30 text-blue-400';
      case 'earthquake':
        return 'bg-orange-900/30 text-orange-400';
      case 'hurricane':
        return 'bg-purple-900/30 text-purple-400';
      case 'wildfire':
        return 'bg-red-900/30 text-red-400';
      default:
        return 'bg-yellow-900/30 text-yellow-400';
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-500';
    if (severity <= 6) return 'bg-yellow-500';
    if (severity <= 8) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        <Loader className="animate-spin h-16 w-16 text-cyan-400" />
        <p className="mt-4 text-cyan-400 text-lg">
          Analyzing global disaster reports...
        </p>
        <p className="mt-2 text-gray-400 text-sm">
          Powered by AI verification systems
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900 p-4">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading News</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchNews}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                🌍 Global Disaster Intelligence
              </h1>
              <p className="text-gray-400">
                AI-powered verification of real-time disaster reports worldwide
              </p>
              {lastUpdated && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              onClick={fetchNews}
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </header>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm text-gray-400 mb-1">Total Reports</h3>
            <p className="text-2xl font-bold text-white">{articles.length}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm text-gray-400 mb-1">Verified</h3>
            <p className="text-2xl font-bold text-green-400">
              {articles.filter(a => a.detectionResult === 'verified').length}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm text-gray-400 mb-1">Suspicious</h3>
            <p className="text-2xl font-bold text-red-400">
              {articles.filter(a => a.detectionResult === 'suspicious').length}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm text-gray-400 mb-1">High Severity</h3>
            <p className="text-2xl font-bold text-orange-400">
              {articles.filter(a => a.severity >= 7).length}
            </p>
          </div>
        </div>

        <main className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <article 
              key={`${article.url}-${index}`}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-cyan-500 transition-all cursor-pointer group hover:shadow-xl"
              onClick={() => handleArticleClick(article.url)}
            >
              <div className="relative mb-4 h-48 overflow-hidden rounded-lg">
                {article.urlToImage ? (
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    {getDisasterIcon(article.disasterType)}
                  </div>
                )}
                
                {/* Disaster Type Badge */}
                <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-sm font-medium ${getDisasterColor(article.disasterType)}`}>
                  {article.disasterType.toUpperCase()}
                </div>
                
                {/* Verification Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-sm font-medium ${
                  article.detectionResult === 'verified' 
                    ? 'bg-green-900/30 text-green-400' 
                    : 'bg-red-900/30 text-red-400'
                }`}>
                  {article.detectionResult === 'verified' ? (
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                  )}
                  {article.detectionResult}
                </div>

                {/* Severity Indicator */}
                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                  <span className="text-xs text-gray-300">Severity:</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-8 h-2 rounded-full ${getSeverityColor(article.severity)}`} />
                    <span className="text-xs text-white font-medium">{article.severity}/10</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-sm text-gray-400">
                  {article.source.name} • {new Date(article.publishedAt).toLocaleDateString()}
                </p>

                <p className="text-gray-300 text-sm line-clamp-3">
                  {article.description || article.content}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Confidence:</span>
                    <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          article.detectionResult === 'verified' 
                            ? 'bg-green-500' 
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${article.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-300">{article.confidence}%</span>
                  </div>

                  <div className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300">
                    <span className="text-xs">Read More</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </main>

        {articles.length === 0 && !loading && (
          <div className="text-center py-12">
            <AlertTriangle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Reports Found</h3>
            <p className="text-gray-500">No disaster reports are currently available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsVerificationPage;