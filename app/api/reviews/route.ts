import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Review } from '@/lib/types';

export async function GET() {
  try {
    const reviewsCollection = await getCollection('reviews');
    const reviews = await reviewsCollection.find({}).toArray();
    return NextResponse.json(reviews);
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
    const reviewsCollection = await getCollection('reviews');
    
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
    return NextResponse.json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 