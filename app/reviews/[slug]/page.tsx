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

// Change from static to ISR with a 1 hour revalidation
export const revalidate = 3600;

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
  url: string;
}

// Add structured data for the movie review
function MovieStructuredData({ movie }: { movie: Movie }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Movie',
      name: movie.title,
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
      inLanguage: getEnglishLanguage(movie.language)
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: movie.rating,
      bestRating: '10',
      worstRating: '1',
      ratingCount: movie.votecount
    },
    author: {
      '@type': 'Organization',
      name: 'Slow Cinema Club'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Slow Cinema Club'
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

  const canonicalUrl = `https://slowcinemaclub.com/reviews/${slug}`;
  
  return {
    title: `${movie.title} (${movie.year}) Review - Slow Cinema Club`,
    description: movie.description,
    openGraph: {
      title: `${movie.title} (${movie.year}) Review - Slow Cinema Club`,
      description: movie.description,
      url: canonicalUrl,
      siteName: 'Slow Cinema Club',
      images: [
        {
          url: movie.imageurl,
          width: 1200,
          height: 800,
          alt: `Movie still from ${movie.title} (${movie.year})`,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${movie.title} (${movie.year}) Review - Slow Cinema Club`,
      description: movie.description,
      images: [movie.imageurl],
    },
    alternates: {
      canonical: canonicalUrl,
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
          alt={movie.title}
          width={1800}
          height={900}
          className="object-cover w-full h-full brightness-75"
          priority
          quality={90}
          sizes="(min-width: 768px) 100vw, 100vw"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white drop-shadow-sm">
            {movie.title} <span className="text-white/80">({movie.year})</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
            <div className="flex items-center gap-1 text-white">
              <span className="text-yellow-400">★</span> 
              <span className="font-medium">{movie.rating.toFixed(1)} ({movie.votecount})</span>
            </div>
            <span>•</span>
            <span>{movie.duration} minutes</span>
            <span>•</span>
            <span>{getEnglishLanguage(movie.language)}</span>
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
          <p className="text-lg">{movie.director}</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground">Cast</h2>
          <p className="text-lg">{movie.cast}</p>
        </div>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none [&>p]:text-muted-foreground [&>p]:my-4 first:[&>p]:mt-0 prose-hr:hidden [&>*]:border-none [&_*]:border-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {movie.description}
        </ReactMarkdown>
      </div>
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

  return (
    <>
      <ScrollToTop />
      <MovieStructuredData movie={movie} />
      <article className="mx-auto max-w-4xl" itemScope itemType="https://schema.org/Review">
        <Suspense fallback={<div className="aspect-[2/1] rounded-xl bg-muted animate-pulse mb-16" role="status" aria-label="Loading movie hero" />}>
          <MovieHero movie={movie} />
        </Suspense>
        <Suspense fallback={
          <div className="mx-auto max-w-3xl space-y-8 px-6 lg:px-0 animate-pulse" role="status" aria-label="Loading movie details">
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-6 bg-muted rounded w-1/2" />
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          </div>
        }>
          <MovieDetails movie={movie} />
        </Suspense>
      </article>
    </>
  );
}
