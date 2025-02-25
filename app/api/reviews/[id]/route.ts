import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/mongodb';
import { Review } from '@/lib/types';
import { revalidateTag } from 'next/cache';

// Set a short revalidation time
export const revalidate = 30;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const reviewsCollection = await getCollection('scc', 'reviews');
    
    let review;
    // Check if the ID is a valid MongoDB ObjectId
    if (ObjectId.isValid(id)) {
      review = await reviewsCollection.findOne({ _id: new ObjectId(id) });
    } else {
      // If not, try to find by numeric id
      review = await reviewsCollection.findOne({ id: parseInt(id) });
    }
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(review, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const json = await request.json();
    const reviewsCollection = await getCollection('scc', 'reviews');
    
    let updateResult;
    // Check if the ID is a valid MongoDB ObjectId
    if (ObjectId.isValid(id)) {
      updateResult = await reviewsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...json, updated_at: new Date().toISOString() } }
      );
    } else {
      // If not, try to update by numeric id
      updateResult = await reviewsCollection.updateOne(
        { id: parseInt(id) },
        { $set: { ...json, updated_at: new Date().toISOString() } }
      );
    }
    
    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Get the updated review to return it
    let updatedReview;
    if (ObjectId.isValid(id)) {
      updatedReview = await reviewsCollection.findOne({ _id: new ObjectId(id) });
    } else {
      updatedReview = await reviewsCollection.findOne({ id: parseInt(id) });
    }
    
    // Trigger revalidation
    try {
      revalidateTag('reviews');
      
      // Revalidate the specific review tag
      revalidateTag(`review-${id}`);
      
      // Call the revalidation API to handle broader revalidation
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/revalidate?tag=reviews`, {
        method: 'POST',
      });
    } catch (revalidateError) {
      console.error('Error revalidating:', revalidateError);
      // Continue even if revalidation fails
    }
    
    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const reviewsCollection = await getCollection('scc', 'reviews');
    
    let deleteResult;
    // Check if the ID is a valid MongoDB ObjectId
    if (ObjectId.isValid(id)) {
      deleteResult = await reviewsCollection.deleteOne({ _id: new ObjectId(id) });
    } else {
      // If not, try to delete by numeric id
      deleteResult = await reviewsCollection.deleteOne({ id: parseInt(id) });
    }
    
    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Trigger revalidation after delete
    try {
      revalidateTag('reviews');
      
      // Call the revalidation API to handle broader revalidation
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/revalidate?tag=reviews`, {
        method: 'POST',
      });
    } catch (revalidateError) {
      console.error('Error revalidating:', revalidateError);
      // Continue even if revalidation fails
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 