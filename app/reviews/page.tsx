export const dynamic = 'force-dynamic';
// Set revalidation time to a much more frequent interval
export const revalidate = 60; // Revalidate every minute

import { Suspense } from "react";
import Link from "next/link";
import { MovieCard } from "@/app/components/MovieCard";
import { getCollection } from "@/lib/mongodb";
import Script from 'next/script';

export interface Movie {
  _id: string;
  title: string;
  imageurl: string;
  imagepreviewurl: string;
  director: string;
  cast: string;
  duration: string;
  year: string;
  language: string;
  description: string;
  rating: number;
  votecount: number;
  updatedat: string;
  updatedAd: string;
  url: string;
}

// Add structured data for the reviews collection page
function ReviewsStructuredData({ movies }: { movies: Movie[] }) {
  // Create a safe date parsing function for structured data
  const getValidDate = (dateStr: string | undefined) => {
    if (!dateStr) return new Date();
    
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

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Film Reviews - Slow Cinema Club',
    description: 'In-depth analysis and reviews of arthouse and experimental cinema. Discover thoughtful critiques of slow cinema, independent films, and avant-garde masterpieces.',
    url: 'https://slowcinemaclub.com/reviews',
    dateModified: new Date().toISOString(), // Add current date for the collection page
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: movies.slice(0, 10).map((movie, index) => {
        const validDate = getValidDate(movie.updatedat || movie.updatedAd);
        
        return {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Review',
            datePublished: validDate.toISOString(),
            reviewBody: movie.description.substring(0, 150) + '...',
            itemReviewed: {
              '@type': 'Movie',
              name: movie.title,
              director: {
                '@type': 'Person',
                name: movie.director
              },
              datePublished: movie.year
            }
          }
        };
      })
    }
  };

  return (
    <Script id="reviews-structured-data" type="application/ld+json">
      {JSON.stringify(structuredData)}
    </Script>
  );
}

// Get all movies for display
async function getMovies(): Promise<Movie[]> {
  try {
    const collection = await getCollection('scc', 'movies');
    
    const movies = await collection.find({}, {
      projection: {
        _id: 1,
        title: 1,
        imageurl: 1,
        imagepreviewurl: 1,
        director: 1,
        cast: 1,
        duration: 1,
        year: 1,
        language: 1,
        description: 1,
        rating: 1,
        votecount: 1,
        updatedat: 1,
        url: 1
      },
      // Sort by updatedat field descending (newest first)
      sort: { updatedat: -1 }
    }).toArray();

    // Create a safe date parsing function
    const getValidDate = (dateStr: string | undefined) => {
      if (!dateStr) return new Date();
      
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

    return movies.map(movie => {
      const validDate = getValidDate(movie.updatedat);
      
      return {
        ...movie,
        _id: movie._id.toString(),
        updatedAd: validDate.toISOString() // Ensure we have a valid ISO string for updatedAd
      } as Movie;
    });
  } catch (error) {
    console.error('Failed to fetch movies:', error);
    return [];
  }
}

export default async function ReviewsPage() {
  const movies = await getMovies();
  
  return (
    <>
      <ReviewsStructuredData movies={movies} />
      
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-serif" id="reviews-heading">Film Reviews</h1>
          
          <div className="flex gap-2">
            <Link 
              href="/feed.xml"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                <path d="M4 11a9 9 0 0 1 9 9" />
                <path d="M4 4a16 16 0 0 1 16 16" />
                <circle cx="5" cy="19" r="1" />
              </svg>
              RSS Feed
            </Link>
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-black/5 dark:bg-white/10">
              {movies.length} Reviews
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {movies.map((movie, index) => (
            <Suspense key={movie._id} fallback={<MovieCardSkeleton />}>
              <MovieCard movie={movie} index={index} />
            </Suspense>
          ))}
        </div>
      </div>
    </>
  );
}

function MovieCardSkeleton() {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-muted/30 shadow-sm transition-all hover:shadow-md" aria-hidden="true">
      <div className="aspect-[16/9] bg-muted animate-pulse" />
      <div className="flex flex-col space-y-2 p-4">
        <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-muted rounded w-full animate-pulse mt-2" />
        <div className="h-4 bg-muted rounded w-full animate-pulse" />
      </div>
    </div>
  );
}