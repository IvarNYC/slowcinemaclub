import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import ISO6391 from 'iso-639-1';

const languageMap: { [key: string]: string } = {
  'Nederlands': 'nl',
  'Engels': 'en',
  'Frans': 'fr',
  'Arabisch': 'ar',
  'Russisch': 'ru',
  'Catalaans': 'ca',
  'Spaans': 'es',
  'Malayalam': 'ml'
};

function convertLanguageToCode(language: string): string {
  // Handle multiple languages
  const languages = language.split(',').map(lang => lang.trim());
  
  return languages.map(lang => {
    // Check if we have a direct mapping
    if (languageMap[lang]) {
      return languageMap[lang];
    }
    
    // Try to get the code from the full name
    const code = ISO6391.getCode(lang);
    if (code) {
      return code;
    }
    
    // If all else fails, return the original
    return lang;
  }).join(', ');
}

export async function GET() {
  try {
    const collection = await getCollection('scc', 'movies');
    
    // Get all movies
    const movies = await collection.find({}).toArray();
    
    // Update each movie's language field
    for (const movie of movies) {
      if (movie.language) {
        const updatedLanguage = convertLanguageToCode(movie.language);
        await collection.updateOne(
          { _id: movie._id },
          { $set: { language: updatedLanguage } }
        );
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully migrated language fields to ISO codes' 
    });
  } catch (error) {
    console.error('Error migrating languages:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to migrate languages' 
    }, { status: 500 });
  }
}
