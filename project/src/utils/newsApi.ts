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
}

interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

export const fetchDisasterNews = async (): Promise<NewsArticle[]> => {
  try {
    const query = encodeURIComponent('(flood OR earthquake OR tsunami OR hurricane OR wildfire OR landslide) AND (disaster OR emergency OR relief)');
    const url = `${NEWS_API_BASE_URL}/everything?q=${query}&sortBy=publishedAt&pageSize=50&apiKey=${NEWS_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`News API error: ${response.status} ${response.statusText}`);
    }
    
    const data: NewsResponse = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error('News API returned an error status');
    }
    
    // Filter articles to only include those with disaster-related keywords
    const disasterKeywords = [
      'flood', 'earthquake', 'tsunami', 'hurricane', 'wildfire', 
      'landslide', 'disaster', 'emergency', 'relief', 'evacuation',
      'damage', 'casualties', 'rescue', 'aid', 'crisis'
    ];
    
    const filteredArticles = data.articles.filter(article => {
      const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
      return disasterKeywords.some(keyword => text.includes(keyword));
    });
    
    return filteredArticles;
  } catch (error) {
    console.error('Error fetching disaster news:', error);
    throw error;
  }
};

export const detectDisasterType = (title: string, content: string): 'earthquake' | 'flood' | 'hurricane' | 'wildfire' | 'other' => {
  const text = `${title} ${content}`.toLowerCase();
  
  if (text.includes('earthquake') || text.includes('seismic') || text.includes('tremor')) {
    return 'earthquake';
  } else if (text.includes('flood') || text.includes('inundation') || text.includes('overflow')) {
    return 'flood';
  } else if (text.includes('hurricane') || text.includes('typhoon') || text.includes('cyclone')) {
    return 'hurricane';
  } else if (text.includes('wildfire') || text.includes('forest fire') || text.includes('bushfire')) {
    return 'wildfire';
  }
  
  return 'other';
};

export const calculateSeverity = (article: NewsArticle): number => {
  const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  
  let severity = 1;
  
  // High severity keywords
  const highSeverityKeywords = ['catastrophic', 'devastating', 'massive', 'major', 'severe', 'deadly', 'fatal'];
  const mediumSeverityKeywords = ['significant', 'moderate', 'considerable', 'substantial'];
  const lowSeverityKeywords = ['minor', 'small', 'light', 'minimal'];
  
  if (highSeverityKeywords.some(keyword => text.includes(keyword))) {
    severity = Math.max(severity, 7);
  } else if (mediumSeverityKeywords.some(keyword => text.includes(keyword))) {
    severity = Math.max(severity, 4);
  } else if (lowSeverityKeywords.some(keyword => text.includes(keyword))) {
    severity = Math.max(severity, 2);
  }
  
  // Check for casualty numbers
  const casualtyMatch = text.match(/(\d+)\s*(dead|killed|deaths|casualties|injured)/);
  if (casualtyMatch) {
    const casualties = parseInt(casualtyMatch[1]);
    if (casualties > 100) severity = Math.max(severity, 9);
    else if (casualties > 50) severity = Math.max(severity, 7);
    else if (casualties > 10) severity = Math.max(severity, 5);
    else if (casualties > 0) severity = Math.max(severity, 3);
  }
  
  return Math.min(severity, 10);
};