import { getCollection } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { Document } from 'mongodb';

// Reduce the revalidation time to 60 seconds for more frequent updates
export const revalidate = 60;

// Use cache tags for more granular control
export async function GET() {
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
            updatedAd: 1,
            url: 1,
            language: 1
          },
        }
      )
      .sort({ updatedAd: -1 })
      .toArray();

    // Serialize MongoDB documents to plain objects and ensure all required fields are present
    const movies = moviesRaw.map((movie: Document) => ({
      _id: movie._id.toString(),
      title: movie.title as string,
      imagepreviewurl: movie.imagepreviewurl as string,
      director: movie.director as string,
      year: movie.year as string,
      description: movie.description as string,
      rating: movie.rating as number,
      duration: movie.duration as string,
      updatedAd: movie.updatedAd as string,
      url: movie.url as string,
      language: (movie.language as string) || ''
    }));

    // Add cache-related headers for more control
    return NextResponse.json(movies, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
} 