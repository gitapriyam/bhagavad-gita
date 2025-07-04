/* eslint-disable prettier/prettier */
// api/searchCognitive.js
// Node.js function to query Azure Cognitive Search for sloka content

require('dotenv').config();
const { app } = require('@azure/functions');
const axios = require('axios');

// These should be set in your environment variables for security
const AZURE_SEARCH_ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT; // e.g., 'https://<YOUR-SEARCH-SERVICE>.search.windows.net'
const AZURE_API_KEY = process.env.AZURE_SEARCH_API_KEY; // Use a query key, not admin key

/**
 *
 * @param {*} request
 * @returns
 */
async function handler(request) {
  const searchText = request.query.get('searchText') || '';
  const top = parseInt(request.query.get('top') || '10', 10);

  if (!searchText) {
    return { status: 400, body: 'Missing search query.' };
  }

  const lang = request.query.get('lang') || 'english';

  let searchQuery = `${searchText}`;

  if (lang === 'english') {
    searchQuery = `${searchText} OR ${searchText}*`;
  }

  const AZURE_INDEX_NAME =
    lang === 'sanskrit'
      ? process.env.AZURE_SANSKRIT_INDEX_NAME
      : process.env.AZURE_INDEX_NAME;

  const url = `${AZURE_SEARCH_ENDPOINT}/indexes/${AZURE_INDEX_NAME}/docs/search?api-version=2023-10-01-Preview`;
  const headers = {
    'Content-Type': 'application/json',
    'api-key': AZURE_API_KEY,
  };
  const body = {
    search: searchQuery,
    queryType: 'full',
    searchMode: 'all',
    top: top,
  };

  try {
    const response = await axios.post(url, body, { headers });
    return {
      status: 200,
      body: JSON.stringify(getSlokasFromResponse(response.data.value)),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    return { status: 500, body: 'Azure Cognitive Search query failed.' };
  }
}

function getSlokasFromResponse(content) {
  if (!content || !content.length) {
    return [];
  }

  const results = content.map((item) => {
    const { chapter, slokaNumber, sloka } = extractSlokaFromContent(
      item
    );

    return {
      chapter,
      slokaNumber,
      sloka
    };
  });

  // Assuming you have a filteredResults array as shown earlier
  return results.sort((a, b) => {
    const chapterA = parseInt(a.chapter, 10);
    const chapterB = parseInt(b.chapter, 10);
    if (chapterA !== chapterB) {
      return chapterA - chapterB;
    }
    const slokaA = parseInt(a.slokaNumber, 10);
    const slokaB = parseInt(b.slokaNumber, 10);
    return slokaA - slokaB;
  });
}


function extractSlokaFromContent(results) {
  try {
    const parsedContent = JSON.parse(results.content);
    return {
      chapter: parsedContent.chapter || null,
      slokaNumber: parsedContent.sloka_number || null,
      sloka: parsedContent.text || '',
    };
  } catch (error) {
    console.error('Error parsing sloka content:', error);
  }
}

app.http('slokaSearch', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'slokaSearch',
  handler,
});

module.exports = { handler };
