import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, ExternalLink, Loader, Droplets, AlertOctagon, Zap, Wind, RefreshCw, TrendingUp } from 'lucide-react';
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
  const [filterType, setFilterType] = useState<string>('all');

  // Enhanced deepfake/misinformation detection
  const detectMisinformation = async (article: any): Promise<{ result: 'verified' | 'suspicious', confidence: number }> => {
    // Simulate AI-powered verification
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      'breaking:', 'urgent:', 'shocking:', 'unbelievable:',
      'you won\'t believe', 'doctors hate', 'secret that',
      'this one trick', 'amazing discovery', 'click here'
    ];
    
    const hasSuspiciousPatterns = suspiciousPatterns.some(pattern => text.includes(pattern));
    
    // Check source reliability (simplified)
    const reliableSources = [
      'reuters', 'ap news', 'bbc', 'cnn', 'npr', 'guardian',
      'washington post', 'new york times', 'associated press',
      'global disaster monitor', 'weather service', 'emergency services'
    ];
    
    const isReliableSource = reliableSources.some(source => 
      article.source.name.toLowerCase().includes(source)
    );
    
    // Calculate confidence based on multiple factors
    let confidence = 50;
    
    if (isReliableSource) confidence += 35;
    if (!hasSuspiciousPatterns) confidence += 20;
    if (article.urlToImage) confidence += 10;
    if (article.content && article.content.length > 200) confidence += 15;
    
    // Add some randomness to simulate AI uncertainty
    confidence += Math.floor(Math.random() * 10) - 5;
    confidence = Math.max(25, Math.min(98, confidence));
    
    return {
      result: confidence > 65 ? 'verified' : 'suspicious',
      confidence
    };
  };

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newsArticles = await fetchDisasterNews();
      
      const processedArticles = await Promise.all(
        newsArticles.slice(0, 24).map(async (article: any) => {
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
        return 'bg-blue-900/30 text-blue-400 border-blue-500/30';
      case 'earthquake':
        return 'bg-orange-900/30 text-orange-400 border-orange-500/30';
      case 'hurricane':
        return 'bg-purple-900/30 text-purple-400 border-purple-500/30';
      case 'wildfire':
        return 'bg-red-900/30 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30';
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-500';
    if (severity <= 6) return 'bg-yellow-500';
    if (severity <= 8) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const filteredArticles = filterType === 'all' 
    ? articles 
    : articles.filter(article => article.disasterType === filterType);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="relative">
          <Loader className="animate-spin h-20 w-20 text-cyan-400" />
          <div className="absolute inset-0 animate-ping h-20 w-20 rounded-full bg-cyan-400/20"></div>
        </div>
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Analyzing Global Disaster Intelligence
          </h2>
          <p className="text-gray-400 text-lg">
            Scanning worldwide news sources...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            AI-powered verification in progress
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <AlertTriangle className="h-20 w-20 text-red-400 mx-auto" />
            <div className="absolute inset-0 animate-pulse h-20 w-20 rounded-full bg-red-400/10 mx-auto"></div>
          </div>
          <h2 className="text-3xl font-bold text-red-400 mb-4">Connection Error</h2>
          <p className="text-gray-400 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={fetchNews}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl flex items-center mx-auto"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-3">
                🌍 Global Disaster Intelligence
              </h1>
              <p className="text-gray-400 text-lg">
                AI-powered verification of real-time disaster reports worldwide
              </p>
              {lastUpdated && (
                <p className="text-sm text-gray-500 mt-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              onClick={fetchNews}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Feed
            </button>
          </div>
        </header>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700/50 shadow-xl">
            <h3 className="text-sm text-gray-400 mb-1">Total Reports</h3>
            <p className="text-2xl font-bold text-white">{articles.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/20 to-gray-900 p-4 rounded-xl border border-green-500/20 shadow-xl">
            <h3 className="text-sm text-gray-400 mb-1">Verified</h3>
            <p className="text-2xl font-bold text-green-400">
              {articles.filter(a => a.detectionResult === 'verified').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-900/20 to-gray-900 p-4 rounded-xl border border-red-500/20 shadow-xl">
            <h3 className="text-sm text-gray-400 mb-1">Suspicious</h3>
            <p className="text-2xl font-bold text-red-400">
              {articles.filter(a => a.detectionResult === 'suspicious').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-900/20 to-gray-900 p-4 rounded-xl border border-orange-500/20 shadow-xl">
            <h3 className="text-sm text-gray-400 mb-1">High Severity</h3>
            <p className="text-2xl font-bold text-orange-400">
              {articles.filter(a => a.severity >= 7).length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/20 to-gray-900 p-4 rounded-xl border border-purple-500/20 shadow-xl">
            <h3 className="text-sm text-gray-400 mb-1">Avg Confidence</h3>
            <p className="text-2xl font-bold text-purple-400">
              {articles.length > 0 ? Math.round(articles.reduce((sum, a) => sum + a.confidence, 0) / articles.length) : 0}%
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['all', 'earthquake', 'flood', 'hurricane', 'wildfire', 'other'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterType === type
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
              {type !== 'all' && (
                <span className="ml-2 text-xs bg-gray-700 px-2 py-1 rounded-full">
                  {articles.filter(a => a.disasterType === type).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <main className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article, index) => (
            <article 
              key={`${article.url}-${index}`}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 hover:border-cyan-500/50 transition-all cursor-pointer group hover:shadow-2xl hover:shadow-cyan-500/10 transform hover:-translate-y-1"
              onClick={() => handleArticleClick(article.url)}
            >
              <div className="relative mb-4 h-48 overflow-hidden rounded-xl">
                {article.urlToImage ? (
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    {getDisasterIcon(article.disasterType)}
                  </div>
                )}
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Disaster Type Badge */}
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-medium border backdrop-blur-sm ${getDisasterColor(article.disasterType)}`}>
                  <div className="flex items-center gap-1">
                    {getDisasterIcon(article.disasterType)}
                    {article.disasterType.toUpperCase()}
                  </div>
                </div>
                
                {/* Verification Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium border backdrop-blur-sm ${
                  article.detectionResult === 'verified' 
                    ? 'bg-green-900/30 text-green-400 border-green-500/30' 
                    : 'bg-red-900/30 text-red-400 border-red-500/30'
                }`}>
                  <div className="flex items-center gap-1">
                    {article.detectionResult === 'verified' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    {article.detectionResult}
                  </div>
                </div>

                {/* Severity Indicator */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-xs text-gray-300">Severity:</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-12 h-2 rounded-full ${getSeverityColor(article.severity)}`} />
                    <span className="text-xs text-white font-medium">{article.severity}/10</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-100 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-tight">
                  {article.title}
                </h3>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{article.source.name}</span>
                  <span className="text-gray-500">{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>

                <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
                  {article.description || article.content}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Confidence:</span>
                      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            article.detectionResult === 'verified' 
                              ? 'bg-green-500' 
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${article.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-300 font-medium">{article.confidence}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors">
                    <span className="text-xs font-medium">Read More</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </main>

        {filteredArticles.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="relative mb-6">
              <AlertTriangle className="h-20 w-20 text-gray-500 mx-auto" />
              <div className="absolute inset-0 animate-pulse h-20 w-20 rounded-full bg-gray-500/10 mx-auto"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-3">No Reports Found</h3>
            <p className="text-gray-500 text-lg">No disaster reports match the current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsVerificationPage;