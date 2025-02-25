import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Review } from '@/lib/types';

// Use a short revalidation time for more responsive reviews
export const revalidate = 60;

export async function GET() {
  try {
    const reviewsCollection = await getCollection('scc', 'reviews');
    const reviews = await reviewsCollection.find({}).toArray();
    
    // Return with cache headers for more granular control
    return NextResponse.json(reviews, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const reviewsCollection = await getCollection('scc', 'reviews');
    
    // Get the highest ID to generate a new one
    const lastReview = await reviewsCollection
      .find({})
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    
    const newId = lastReview.length > 0 ? lastReview[0].id + 1 : 1;
    
    const newReview: Review = {
      ...json,
      id: newId,
      created_at: new Date().toISOString()
    };
    
    await reviewsCollection.insertOne(newReview);
    
    // After creating a new review, trigger revalidation
    try {
      // Revalidate the reviews and movies endpoints
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/revalidate?tag=reviews`, {
        method: 'POST',
      });
    } catch (revalidateError) {
      console.error('Error revalidating:', revalidateError);
      // Continue even if revalidation fails
    }
    
    return NextResponse.json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 