import { Suspense } from "react";
import { getCollection } from "@/lib/mongodb";
import { MovieCard } from "@/app/components/MovieCard";
import { Metadata } from 'next';
import Link from 'next/link';

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

interface Movie {
  _id: string;
  title: string;
  imageurl: string;
  imagepreviewurl: string;
  director: string;
  year: string;
  description: string;
  rating: number;
  duration: string;
  updatedat: string;
  url: string;
}

const ITEMS_PER_PAGE = 12;

async function getMovies(page: number = 1): Promise<{ movies: Movie[], total: number }> {
  try {
    const collection = await getCollection('scc', 'movies');
    const skip = (page - 1) * ITEMS_PER_PAGE;
    
    const [moviesRaw, total] = await Promise.all([
      collection
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
              url: 1
            },
          }
        )
        .sort({ updatedat: -1 })
        .skip(skip)
        .limit(ITEMS_PER_PAGE)
        .toArray(),
      collection.countDocuments()
    ]);

    // Serialize MongoDB documents to plain objects
    const movies = moviesRaw.map(movie => ({
      ...movie,
      _id: movie._id.toString()
    }));

    return { movies, total };
  } catch (error) {
    console.error('Error fetching movies:', error);
    return { movies: [], total: 0 };
  }
}

function PaginationControls({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  return (
    <div className="mt-12 flex justify-center gap-2">
      {currentPage > 1 && (
        <Link
          href={`/reviews?page=${currentPage - 1}`}
          className="px-4 py-2 border rounded hover:bg-muted"
          rel="prev"
        >
          Previous
        </Link>
      )}
      <span className="px-4 py-2">
        Page {currentPage} of {totalPages}
      </span>
      {currentPage < totalPages && (
        <Link
          href={`/reviews?page=${currentPage + 1}`}
          className="px-4 py-2 border rounded hover:bg-muted"
          rel="next"
        >
          Next
        </Link>
      )}
    </div>
  );
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

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const { movies, total } = await getMovies(currentPage);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <h1 className="text-4xl font-serif mb-8">Film Reviews</h1>
      <Suspense fallback={<div>Loading reviews...</div>}>
        <MovieGrid movies={movies} />
        <PaginationControls currentPage={currentPage} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}