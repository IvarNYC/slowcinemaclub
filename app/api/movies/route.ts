import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { headers } from 'next/headers';
import { Sort } from 'mongodb';

// Cache the response for 1 hour
export const revalidate = 3600;

export async function GET(request: Request) {
  const headersList = headers();
  const referer = headersList.get('referer') || 'Unknown';

  try {
    const moviesCollection = await getCollection('scc', 'movies');
    
    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const skip = parseInt(url.searchParams.get('skip') || '0');
    const sort = url.searchParams.get('sort') || 'updatedat';
    const order = url.searchParams.get('order') === 'asc' ? 1 : -1;
    
    // Validate parameters
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be between 1 and 100.' },
        { status: 400 }
      );
    }
    
    if (isNaN(skip) || skip < 0) {
      return NextResponse.json(
        { error: 'Invalid skip parameter. Must be >= 0.' },
        { status: 400 }
      );
    }
    
    // Build sort object
    const sortObj = { [sort]: order } as Sort;
    
    // Get total count for pagination
    const total = await moviesCollection.countDocuments();
    
    // Fetch movies with pagination and sorting
    const movies = await moviesCollection
      .find({})
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Add cache control headers
    const response = NextResponse.json({
      movies,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total
      }
    });
    
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    
    return response;
  } catch (error) {
    console.error('Error fetching movies:', error, { referer });
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }
} 