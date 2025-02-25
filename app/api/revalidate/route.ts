import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get('tag');
  const movieSlug = request.nextUrl.searchParams.get('movieSlug');
  const path = request.nextUrl.searchParams.get('path');
  
  if (!tag && !movieSlug && !path) {
    return NextResponse.json(
      { error: 'Missing tag, movieSlug, or path parameter' },
      { status: 400 }
    );
  }

  try {
    if (tag) {
      revalidateTag(tag);
      
      // If the reviews tag is specified, also revalidate related tags
      if (tag === 'reviews') {
        revalidateTag('movies');
        revalidatePath('/');
        revalidatePath('/reviews');
      }
    }
    
    if (movieSlug) {
      // Revalidate both the specific movie and the movies list
      revalidateTag(`movie-${movieSlug}`);
      revalidateTag('movies');
      revalidatePath(`/reviews/${movieSlug}`);
    }
    
    if (path) {
      revalidatePath(path);
    }

    return NextResponse.json({ 
      revalidated: true, 
      tag: tag || `movie-${movieSlug}` || path
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Error revalidating: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 