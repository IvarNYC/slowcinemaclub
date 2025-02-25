import { Suspense } from "react";
import { getCollection } from "@/lib/mongodb";
import { MovieCard, Movie } from "@/app/components/MovieCard";
import { Metadata } from 'next';
import { Document } from 'mongodb';

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

// Add metadata for the reviews page
export const metadata: Metadata = {
  title: 'Film Reviews - Slow Cinema Club',
  description: 'In-depth analysis and reviews of arthouse and experimental cinema. Discover thoughtful critiques of slow cinema, independent films, and avant-garde masterpieces.',
  openGraph: {
    title: 'Film Reviews - Slow Cinema Club',
    description: 'In-depth analysis and reviews of arthouse and experimental cinema. Discover thoughtful critiques of slow cinema, independent films, and avant-garde masterpieces.',
    type: 'website',
  },
};

async function getAllMovies(): Promise<Movie[]> {
  try {
    const collection = await getCollection('scc', 'movies');
    
    const moviesRaw = await collection
      .find(
        {},
        {
          projection: {
            _id: 1,
            title: 1,
            imagepreviewurl: 1,
            director: 1,
            year: 1,
            description: 1,
            rating: 1,
            duration: 1,
            updatedat: 1,
            url: 1,
            language: 1
          },
        }
      )
      .sort({ updatedat: -1 })
      .toArray();

    // Serialize MongoDB documents to plain objects and ensure all required fields are present
    const movies: Movie[] = moviesRaw.map((movie: Document) => ({
      _id: movie._id.toString(),
      title: movie.title as string,
      imagepreviewurl: movie.imagepreviewurl as string,
      director: movie.director as string,
      year: movie.year as string,
      description: movie.description as string,
      rating: movie.rating as number,
      duration: movie.duration as string,
      updatedat: movie.updatedat as string,
      url: movie.url as string,
      language: (movie.language as string) || ''
    }));

    return movies;
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
}

function MovieGrid({ movies }: { movies: Movie[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {movies.map((movie, index) => (
        <MovieCard key={movie._id} movie={movie} index={index} />
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  const movies = await getAllMovies();

  return (
    <div>
      <h1 className="text-4xl font-serif mb-8">Film Reviews</h1>
      <Suspense fallback={<div>Loading reviews...</div>}>
        <MovieGrid movies={movies} />
      </Suspense>
    </div>
  );
}