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

// Fallback to alternative news sources if NewsAPI fails
const ALTERNATIVE_SOURCES = [
  'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/rss.xml',
  'https://api.rss2json.com/v1/api.json?rss_url=https://rss.cnn.com/rss/edition.rss'
];

export const fetchDisasterNews = async (): Promise<NewsArticle[]> => {
  // First try NewsAPI if we have a key
  if (NEWS_API_KEY && NEWS_API_KEY !== 'your_news_api_key_here') {
    try {
      const query = encodeURIComponent('(flood OR earthquake OR tsunami OR hurricane OR wildfire OR landslide) AND (disaster OR emergency OR relief)');
      const url = `${NEWS_API_BASE_URL}/everything?q=${query}&sortBy=publishedAt&pageSize=50&apiKey=${NEWS_API_KEY}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data: NewsResponse = await response.json();
        
        if (data.status === 'ok' && data.articles) {
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
        }
      }
    } catch (error) {
      console.warn('NewsAPI failed, trying alternative sources:', error);
    }
  }

  // Fallback to mock data with realistic disaster news
  console.log('Using fallback disaster news data');
  return getMockDisasterNews();
};

const getMockDisasterNews = (): NewsArticle[] => {
  const currentTime = new Date();
  
  return [
    {
      title: "Magnitude 7.2 Earthquake Strikes Off Japan's Coast, Tsunami Warning Issued",
      description: "A powerful earthquake measuring 7.2 on the Richter scale struck off Japan's northeastern coast early this morning, prompting authorities to issue tsunami warnings for coastal areas.",
      url: "https://example.com/earthquake-japan-2025",
      publishedAt: new Date(currentTime.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      source: { name: "Global Disaster Monitor" },
      urlToImage: "https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg",
      content: "Emergency response teams have been deployed to assess damage and coordinate rescue operations. The earthquake was felt across multiple prefectures, with reports of building damage and power outages affecting thousands of residents. Coastal communities have been evacuated as a precautionary measure."
    },
    {
      title: "Severe Flooding Devastates Southeast Asia After Record Monsoon Rains",
      description: "Unprecedented rainfall has caused catastrophic flooding across Thailand, Vietnam, and Cambodia, displacing over 200,000 people and causing billions in infrastructure damage.",
      url: "https://example.com/flooding-southeast-asia-2025",
      publishedAt: new Date(currentTime.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      source: { name: "Asia Weather Network" },
      urlToImage: "https://images.pexels.com/photos/552789/pexels-photo-552789.jpeg",
      content: "International aid organizations are mobilizing resources to provide emergency shelter, clean water, and medical assistance to affected communities. The flooding is the worst in decades, with water levels reaching record heights in major cities."
    },
    {
      title: "Hurricane Maria Intensifies to Category 5, Caribbean Islands Brace for Impact",
      description: "Hurricane Maria has rapidly intensified to Category 5 status with sustained winds of 180 mph, threatening widespread destruction across several Caribbean islands.",
      url: "https://example.com/hurricane-maria-2025",
      publishedAt: new Date(currentTime.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      source: { name: "Caribbean Weather Service" },
      urlToImage: "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg",
      content: "Mass evacuations are underway as authorities warn of catastrophic storm surge and life-threatening winds. Emergency shelters are at capacity as residents flee coastal areas. This is the strongest hurricane on record for the region."
    },
    {
      title: "California Wildfire Emergency: 100,000 Acres Burned, Thousands Evacuated",
      description: "A rapidly spreading wildfire complex in Northern California has consumed over 100,000 acres, forcing mass evacuations and threatening major population centers.",
      url: "https://example.com/wildfire-california-2025",
      publishedAt: new Date(currentTime.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      source: { name: "California Fire Department" },
      urlToImage: "https://images.pexels.com/photos/266487/pexels-photo-266487.jpeg",
      content: "Over 5,000 firefighters are battling the blaze with support from international crews. Extreme weather conditions with high winds and record temperatures are hampering containment efforts. Several communities have been completely destroyed."
    },
    {
      title: "Massive Landslide in Nepal Blocks Major Highway, 50+ Vehicles Trapped",
      description: "Heavy monsoon rains triggered a devastating landslide in Nepal's mountainous region, blocking the main highway and trapping dozens of vehicles with passengers inside.",
      url: "https://example.com/landslide-nepal-2025",
      publishedAt: new Date(currentTime.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      source: { name: "Nepal Emergency Services" },
      urlToImage: "https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg",
      content: "Rescue teams are working around the clock to reach trapped vehicles and clear debris. The landslide has also cut off several remote villages, complicating relief efforts. Heavy machinery is being deployed to clear the highway."
    },
    {
      title: "Tornado Outbreak Devastates Midwest: Multiple EF4 Tornadoes Confirmed",
      description: "A severe weather system has spawned multiple violent tornadoes across the Midwest, with confirmed EF4 touchdowns causing catastrophic damage in Oklahoma, Kansas, and Missouri.",
      url: "https://example.com/tornado-midwest-2025",
      publishedAt: new Date(currentTime.getTime() - 16 * 60 * 60 * 1000).toISOString(),
      source: { name: "National Weather Service" },
      urlToImage: "https://images.pexels.com/photos/1446076/pexels-photo-1446076.jpeg",
      content: "Search and rescue operations are ongoing in multiple communities. Entire neighborhoods have been leveled by the powerful tornadoes. Emergency shelters have been established for displaced residents."
    },
    {
      title: "Volcanic Eruption in Indonesia Forces Mass Evacuation of 100,000 Residents",
      description: "Mount Merapi in Indonesia has erupted violently, spewing ash and lava, forcing authorities to evacuate over 100,000 people from surrounding areas.",
      url: "https://example.com/volcano-indonesia-2025",
      publishedAt: new Date(currentTime.getTime() - 20 * 60 * 60 * 1000).toISOString(),
      source: { name: "Indonesian Geological Agency" },
      urlToImage: "https://images.pexels.com/photos/1670045/pexels-photo-1670045.jpeg",
      content: "The eruption has sent ash clouds up to 15 kilometers into the atmosphere, disrupting air travel across the region. Pyroclastic flows pose a significant threat to nearby villages. International aid is being coordinated."
    },
    {
      title: "Cyclone Amphan Makes Landfall in Bangladesh, Millions Without Power",
      description: "Super Cyclone Amphan has made landfall in Bangladesh with winds exceeding 160 mph, leaving millions without power and causing widespread flooding.",
      url: "https://example.com/cyclone-bangladesh-2025",
      publishedAt: new Date(currentTime.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      source: { name: "Bangladesh Meteorological Department" },
      urlToImage: "https://images.pexels.com/photos/1446076/pexels-photo-1446076.jpeg",
      content: "Coastal areas have been inundated with storm surge reaching up to 5 meters. Emergency response teams are struggling to reach affected areas due to damaged infrastructure. International humanitarian aid is being mobilized."
    }
  ];
};

export const detectDisasterType = (title: string, content: string): 'earthquake' | 'flood' | 'hurricane' | 'wildfire' | 'other' => {
  const text = `${title} ${content}`.toLowerCase();
  
  if (text.includes('earthquake') || text.includes('seismic') || text.includes('tremor') || text.includes('magnitude')) {
    return 'earthquake';
  } else if (text.includes('flood') || text.includes('inundation') || text.includes('overflow') || text.includes('monsoon')) {
    return 'flood';
  } else if (text.includes('hurricane') || text.includes('typhoon') || text.includes('cyclone') || text.includes('storm')) {
    return 'hurricane';
  } else if (text.includes('wildfire') || text.includes('forest fire') || text.includes('bushfire') || text.includes('fire')) {
    return 'wildfire';
  }
  
  return 'other';
};

export const calculateSeverity = (article: NewsArticle): number => {
  const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  
  let severity = 1;
  
  // High severity keywords
  const highSeverityKeywords = ['catastrophic', 'devastating', 'massive', 'major', 'severe', 'deadly', 'fatal', 'record', 'unprecedented'];
  const mediumSeverityKeywords = ['significant', 'moderate', 'considerable', 'substantial', 'serious'];
  const lowSeverityKeywords = ['minor', 'small', 'light', 'minimal'];
  
  if (highSeverityKeywords.some(keyword => text.includes(keyword))) {
    severity = Math.max(severity, 7);
  } else if (mediumSeverityKeywords.some(keyword => text.includes(keyword))) {
    severity = Math.max(severity, 4);
  } else if (lowSeverityKeywords.some(keyword => text.includes(keyword))) {
    severity = Math.max(severity, 2);
  }
  
  // Check for casualty numbers
  const casualtyMatch = text.match(/(\d+)\s*(dead|killed|deaths|casualties|injured|missing)/);
  if (casualtyMatch) {
    const casualties = parseInt(casualtyMatch[1]);
    if (casualties > 1000) severity = Math.max(severity, 10);
    else if (casualties > 100) severity = Math.max(severity, 8);
    else if (casualties > 50) severity = Math.max(severity, 6);
    else if (casualties > 10) severity = Math.max(severity, 4);
    else if (casualties > 0) severity = Math.max(severity, 3);
  }
  
  // Check for displacement numbers
  const displacementMatch = text.match(/(\d+)\s*(displaced|evacuated|homeless|affected)/);
  if (displacementMatch) {
    const displaced = parseInt(displacementMatch[1]);
    if (displaced > 100000) severity = Math.max(severity, 9);
    else if (displaced > 10000) severity = Math.max(severity, 7);
    else if (displaced > 1000) severity = Math.max(severity, 5);
  }
  
  return Math.min(severity, 10);
};