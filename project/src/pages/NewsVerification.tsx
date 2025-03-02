import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, ExternalLink, Loader } from 'lucide-react';

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
  detectionResult: 'verified' | 'deepfake' | 'pending';
  confidence: number;
}

const NewsVerificationPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock deepfake detection (replace with real API call)
  const detectDeepfake = async (content: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      result: Math.random() > 0.15 ? 'verified' : 'deepfake' as 'verified' | 'deepfake',
      confidence: Math.floor(Math.random() * (95 - 75) + 75)
    };
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=(flood OR earthquake) AND india&apiKey=f66b8fe8d9274527b6af4c2306eaf39c&pageSize=20&sortBy=publishedAt`
        );
        
        if (!response.ok) throw new Error('Failed to fetch news');
        
        const data = await response.json();
        
        // Process articles with deepfake detection
        const processedArticles = await Promise.all(
          data.articles.map(async (article: any) => {
            const detection = await detectDeepfake(article.content);
            return {
              ...article,
              detectionResult: detection.result,
              confidence: detection.confidence
            };
          })
        );

        setArticles(processedArticles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const handleArticleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <Loader className="animate-spin h-12 w-12 text-cyan-400" />
        <span className="ml-2 text-cyan-400">Fetching latest reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-red-400 text-xl text-center p-4">
          {error}<br/>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            🇮🇳 Live India Disaster Monitor
          </h1>
          <p className="text-gray-400">
            Real-time flood & earthquake reports with AI verification
          </p>
        </header>

        <main className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article 
              key={article.url}
              className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-cyan-500 transition-colors cursor-pointer group"
              onClick={() => handleArticleClick(article.url)}
            >
              {article.urlToImage && (
                <div className="relative mb-4 h-48 overflow-hidden rounded-lg">
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-sm ${
                    article.detectionResult === 'verified' 
                      ? 'bg-green-900/30 text-green-400' 
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {article.detectionResult}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 group-hover:text-cyan-300 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {article.source.name} • {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                {article.description || article.content}
              </p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <span>Verification Confidence:</span>
                  <div className="w-20 h-2 bg-gray-700 rounded-full">
                    <div
                      className={`h-full rounded-full ${
                        article.detectionResult === 'verified' 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${article.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300">
                  <span>View Report</span>
                  <ExternalLink className="h-4 w-4" />
                </div>
              </div>
            </article>
          ))}
        </main>
      </div>
    </div>
  );
};

export default NewsVerificationPage;