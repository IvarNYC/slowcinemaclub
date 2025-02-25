import { getDb } from './mongodb';

export async function initializeDatabase() {
  try {
    const db = await getDb('scc');
    const movies = db.collection('movies');

    // Create indexes
    await movies.createIndexes([
      // Main listing index
      {
        key: { updatedat: -1 },
        name: 'movies_updatedat_desc'
      },
      // Title search index
      {
        key: { title: 1 },
        name: 'movies_title'
      },
      // Compound index for filtering and sorting
      {
        key: { 
          year: -1,
          rating: -1,
          updatedat: -1
        },
        name: 'movies_year_rating_updatedat'
      },
      // Text search index
      {
        key: { 
          title: 'text',
          director: 'text',
          description: 'text'
        },
        name: 'movies_text_search',
        weights: {
          title: 10,
          director: 5,
          description: 1
        }
      }
    ]);

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
} 