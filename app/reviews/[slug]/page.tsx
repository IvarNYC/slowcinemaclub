export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every minute

import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getCollection } from "@/lib/mongodb";
import { Metadata } from 'next';
import Script from 'next/script';
import { ScrollToTop } from "@/app/components/ScrollToTop";
import { getEnglishLanguage } from '@/lib/utils/language';

interface Movie {
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
  updatedAd?: string;
  url: string;
}

// Add structured data for the movie review
function MovieStructuredData({ movie }: { movie: Movie }) {
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

  const publishDate = getValidDate(movie.updatedat || movie.updatedAd || '');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: `${movie.title} (${movie.year}) - Film Review`,
    reviewBody: movie.description.substring(0, 500) + '...',
    datePublished: publishDate.toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Slow Cinema Club',
      url: 'https://slowcinemaclub.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Slow Cinema Club',
      url: 'https://slowcinemaclub.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://slowcinemaclub.com/logo.png'
      }
    },
    itemReviewed: {
      '@type': 'Movie',
      name: movie.title,
      image: movie.imageurl,
      director: {
        '@type': 'Person',
        name: movie.director
      },
      actor: movie.cast.split(',').map(actor => ({
        '@type': 'Person',
        name: actor.trim()
      })),
      datePublished: movie.year,
      duration: `PT${movie.duration}M`,
      inLanguage: getEnglishLanguage(movie.language),
      description: movie.description.substring(0, 200) + '...',
      url: `https://slowcinemaclub.com/reviews/${movie.url}`
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: movie.rating,
      bestRating: '10',
      worstRating: '1',
      ratingCount: movie.votecount
    }
  };

  return (
    <Script id="movie-structured-data" type="application/ld+json">
      {JSON.stringify(structuredData)}
    </Script>
  );
}

// Update metadata generation with more SEO-friendly properties
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;
  const movie = await getMovie(slug);
  if (!movie) return {};

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

  const publishDate = getValidDate(movie.updatedat || movie.updatedAd || '');
  const canonicalUrl = `https://slowcinemaclub.com/reviews/${slug}`;
  
  // Create a rich, keyword-optimized description
  const directorPhrase = movie.director ? `directed by ${movie.director}` : '';
  const yearPhrase = movie.year ? `released in ${movie.year}` : '';
  const enrichedDescription = `Read our in-depth analysis and critique of ${movie.title}, ${directorPhrase} ${yearPhrase}. This slow cinema masterpiece explores ${movie.description.substring(0, 150)}... Explore artistic cinematography, narrative techniques, and cultural impact in our comprehensive review.`;
  
  // Extract relevant keywords from the movie data
  const keywords = [
    movie.title,
    movie.director,
    `${movie.title} film`,
    `${movie.title} movie`,
    `${movie.title} review`,
    `${movie.title} analysis`,
    `${movie.director} director`,
    `${movie.year} film`,
    'slow cinema',
    'art house cinema',
    'film analysis',
    'film critique',
    'arthouse film review',
    getEnglishLanguage(movie.language) + ' cinema'
  ].filter(Boolean);
  
  return {
    title: `${movie.title} (${movie.year}) - Film Review | Slow Cinema Club`,
    description: enrichedDescription,
    keywords: keywords,
    openGraph: {
      title: `${movie.title} (${movie.year}) - Film Review | Slow Cinema Club`,
      description: enrichedDescription,
      url: canonicalUrl,
      siteName: 'Slow Cinema Club',
      images: [
        {
          url: movie.imageurl,
          width: 1200,
          height: 800,
          alt: `Movie still from ${movie.title} (${movie.year}) directed by ${movie.director}`,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: publishDate.toISOString(),
      authors: ['Slow Cinema Club'],
      tags: keywords.slice(0, 5),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${movie.title} (${movie.year}) Review - Slow Cinema Club`,
      description: enrichedDescription,
      images: [movie.imageurl],
      creator: '@slowcinemaclub',
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  };
}

async function getMovie(slug: string): Promise<Movie | null> {
  try {
    const collection = await getCollection('scc', 'movies');
    
    // Get the movie by matching the slug from the URL
    const movie = await collection.findOne(
      { url: { $regex: new RegExp(slug + '$', 'i') } },
      {
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
        }
      }
    );

    if (!movie) {
      return null;
    }

    return {
      ...movie,
      _id: movie._id.toString()
    } as Movie;
  } catch (error) {
    console.error('Failed to fetch movie:', error);
    return null;
  }
}

function MovieHero({ movie }: { movie: Movie }) {
  return (
    <div className="relative mb-16">
      <div className="aspect-[2/1] overflow-hidden rounded-xl bg-muted">
        <Image
          src={movie.imageurl}
          alt={`Movie still from ${movie.title} (${movie.year}) directed by ${movie.director}`}
          width={1800}
          height={900}
          className="object-cover w-full h-full brightness-75"
          priority
          quality={90}
          sizes="(min-width: 768px) 100vw, 100vw"
          itemProp="image"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <h1 
            id="movie-title"
            className="text-4xl md:text-5xl font-medium tracking-tight text-white drop-shadow-sm" 
            itemProp="name"
          >
            {movie.title} <span className="text-white/80">({movie.year})</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
            {movie.rating > 0 && movie.votecount > 0 && (
              <>
                <div className="flex items-center gap-1 text-white" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
                  <span className="text-yellow-400">★</span> 
                  <span className="font-medium">
                    <span itemProp="ratingValue">{movie.rating.toFixed(1)}</span> 
                    (<span itemProp="ratingCount">{movie.votecount}</span>)
                  </span>
                  <meta itemProp="bestRating" content="10" />
                  <meta itemProp="worstRating" content="1" />
                </div>
                <span aria-hidden="true">•</span>
              </>
            )}
            <span itemProp="duration">{movie.duration} minutes</span>
            <span aria-hidden="true">•</span>
            <span itemProp="inLanguage">{getEnglishLanguage(movie.language)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MovieDetails({ movie }: { movie: Movie }) {
  return (
    <div className="mx-auto max-w-3xl space-y-12 px-6 lg:px-0">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground">Director</h2>
          <p className="text-2xl" itemProp="director" itemScope itemType="https://schema.org/Person">
            <span itemProp="name">{movie.director}</span>
          </p>
        </div>
        
        {movie.cast && movie.cast.trim() !== '' && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground">Cast</h2>
            <p className="text-2xl">
              {movie.cast.split(',').map((actor, index, array) => (
                <span key={actor} itemProp="actor" itemScope itemType="https://schema.org/Person">
                  <span itemProp="name">{actor.trim()}</span>
                  {index < array.length - 1 && <span className="mx-1" aria-hidden="true">,</span>}
                </span>
              ))}
            </p>
          </div>
        )}
      </div>

      <div 
        className="prose prose-neutral dark:prose-invert max-w-none text-2xl [&>p]:text-muted-foreground [&>p]:my-4 first:[&>p]:mt-0 prose-hr:hidden [&>*]:border-none [&_*]:border-none [&>h1]:text-4xl [&>h2]:text-3xl [&>h3]:text-2xl"
        itemProp="reviewBody"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {movie.description}
        </ReactMarkdown>
      </div>
      
      <section aria-label="Film metadata" className="pt-8 border-t border-muted">
        <h2 className="sr-only">Additional Information</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Release Year</dt>
            <dd itemProp="dateCreated">{movie.year}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Language</dt>
            <dd itemProp="inLanguage">{getEnglishLanguage(movie.language)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Duration</dt>
            <dd itemProp="duration">{movie.duration} minutes</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Rating</dt>
            <dd>
              <div className="inline-flex items-center gap-1">
                <span className="text-yellow-400">★</span> 
                <span>{movie.rating.toFixed(1)}/10</span>
              </div>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export default async function Page({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = await Promise.resolve(params);
  const movie = await getMovie(slug);

  if (!movie) {
    notFound();
  }

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

  const validDate = getValidDate(movie.updatedat || movie.updatedAd || '');

  // Format date for display and metadata
  const publishDate = validDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      <ScrollToTop />
      <MovieStructuredData movie={movie} />
      
      <article 
        className="mx-auto max-w-4xl"
        itemScope 
        itemType="https://schema.org/Review"
        aria-labelledby="movie-title"
      >
        <meta itemProp="author" content="Slow Cinema Club" />
        <meta itemProp="datePublished" content={validDate.toISOString()} />
        <meta itemProp="reviewRating" content={movie.rating.toString()} />
        
        <div itemProp="itemReviewed" itemScope itemType="https://schema.org/Movie">
          <meta itemProp="name" content={movie.title} />
          <meta itemProp="director" content={movie.director} />
          <meta itemProp="datePublished" content={movie.year} />
          <meta itemProp="inLanguage" content={getEnglishLanguage(movie.language)} />
        </div>
        
        <Suspense fallback={<div className="aspect-[2/1] rounded-xl bg-muted animate-pulse mb-16" role="status" aria-label="Loading movie hero" />}>
          <MovieHero movie={movie} />
        </Suspense>
        
        <div className="mx-auto max-w-3xl px-6 lg:px-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <time dateTime={validDate.toISOString()}>
              {publishDate}
            </time>
            <span>•</span>
            <span>Film Review</span>
          </div>
        </div>
        
        <Suspense fallback={
          <div className="mx-auto max-w-3xl space-y-8 px-6 lg:px-0 animate-pulse" role="status" aria-label="Loading movie details">
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-6 bg-muted rounded w-3/4" />
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded w-full" />
              ))}
            </div>
          </div>
        }>
          <MovieDetails movie={movie} />
        </Suspense>
        
        <footer className="mx-auto max-w-3xl mt-16 px-6 lg:px-0 pt-8 border-t border-muted text-sm text-muted-foreground">
          <p>
            This review of <strong>{movie.title}</strong> was written by Slow Cinema Club. 
            Last updated on {publishDate}.
          </p>
          
          <div className="mt-4 pt-4 border-t border-muted flex flex-wrap gap-2">
            {movie.title && <span className="px-2 py-1 bg-muted rounded-full">#{movie.title.toLowerCase().replace(/\s+/g, '')}</span>}
            {movie.director && <span className="px-2 py-1 bg-muted rounded-full">#{movie.director.toLowerCase().split(' ').pop()}</span>}
            <span className="px-2 py-1 bg-muted rounded-full">#slowcinema</span>
            <span className="px-2 py-1 bg-muted rounded-full">#{getEnglishLanguage(movie.language).toLowerCase()}</span>
          </div>
        </footer>
      </article>
    </>
  );
}
