export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every minute to match page.tsx revalidate period

import { MetadataRoute } from 'next';
import { getCollection } from '@/lib/mongodb';

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const collection = await getCollection('scc', 'movies');
  
  // Get all movies with relevant fields for sitemap
  const movies = await collection.find({}, {
    projection: {
      title: 1,
      updatedat: 1,
      year: 1
    }
  }).toArray();

  // Create individual review page entries with priority based on recency
  const currentTime = new Date().getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const oneMonth = 30 * 24 * 60 * 60 * 1000;
  
  // Create a safe date parsing function
  const getValidDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return new Date(); // Fallback to current date if invalid
      }
      return date;
    } catch (_e) { // eslint-disable-line @typescript-eslint/no-unused-vars
      return new Date(); // Fallback to current date on error
    }
  };
  
  const reviewPages = movies.map((movie) => {
    const validDate = getValidDate(movie.updatedat);
    const updatedTime = validDate.getTime();
    const timeDiff = currentTime - updatedTime;
    
    // Assign priority based on how recent the review is
    let priority = 0.7; // Default
    let changeFreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'monthly';
    
    if (timeDiff < oneWeek) {
      // Reviews updated within the last week
      priority = 0.9;
      changeFreq = 'weekly';
    } else if (timeDiff < oneMonth) {
      // Reviews updated within the last month
      priority = 0.8;
      changeFreq = 'monthly';
    }
    
    return {
      url: `https://slowcinemaclub.com/reviews/${createSlug(movie.title)}`,
      lastModified: validDate.toISOString(),
      changeFrequency: changeFreq,
      priority,
    };
  });

  // Add static pages with appropriate priorities
  const staticPages = [
    {
      url: 'https://slowcinemaclub.com',
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: 'https://slowcinemaclub.com/reviews',
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: 'https://slowcinemaclub.com/lists',
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: 'https://slowcinemaclub.com/articles',
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: 'https://slowcinemaclub.com/feed.xml',
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.4,
    },
  ];

  return [...staticPages, ...reviewPages];
}