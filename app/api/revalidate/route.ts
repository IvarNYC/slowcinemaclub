import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get('tag');
  const movieSlug = request.nextUrl.searchParams.get('movieSlug');
  
  if (!tag && !movieSlug) {
    return NextResponse.json(
      { error: 'Missing tag or movieSlug parameter' },
      { status: 400 }
    );
  }

  try {
    if (tag) {
      revalidateTag(tag);
    }
    
    if (movieSlug) {
      // Revalidate both the specific movie and the movies list
      revalidateTag(`movie-${movieSlug}`);
      revalidateTag('movies');
    }

    return NextResponse.json({ 
      revalidated: true, 
      tag: tag || `movie-${movieSlug}` 
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Error revalidating: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 