import ISO6391 from 'iso-639-1';

// Common language mappings that might not be in ISO standard
const languageMap: { [key: string]: string } = {
  'catalaans': 'ca',
  'spaans': 'es',
  'ijslands': 'is',
  'nederlands': 'nl',
  'engels': 'en',
  'frans': 'fr'
};

export function getEnglishLanguage(language: string): string {
  if (!language) return '';

  // Handle multiple languages separated by commas
  const languages = language.split(',').map(lang => {
    const trimmedLang = lang.trim().toLowerCase();
    
    // Check if we have a direct mapping
    if (languageMap[trimmedLang]) {
      return ISO6391.getName(languageMap[trimmedLang]);
    }
    
    // If it's already a valid ISO code
    if (ISO6391.validate(trimmedLang)) {
      return ISO6391.getName(trimmedLang);
    }
    
    // Try to get the ISO code from the language name
    const code = ISO6391.getCode(trimmedLang);
    if (code) {
      return ISO6391.getName(code);
    }
    
    // If all else fails, return the original with proper capitalization
    return trimmedLang.charAt(0).toUpperCase() + trimmedLang.slice(1);
  });

  return languages.join(', ');
}
