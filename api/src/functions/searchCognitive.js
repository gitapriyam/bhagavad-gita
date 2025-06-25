/* eslint-disable prettier/prettier */
// api/searchCognitive.js
// Node.js function to query Azure Cognitive Search for sloka content

require('dotenv').config();
const { app } = require('@azure/functions');
const axios = require('axios');

// These should be set in your environment variables for security
const AZURE_SEARCH_ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT; // e.g., 'https://<YOUR-SEARCH-SERVICE>.search.windows.net'
const AZURE_INDEX_NAME = process.env.AZURE_INDEX_NAME; // e.g., 'english-slokas-index'
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
  const searchQuery = `${searchText} OR ${searchText}*`;

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

  const filteredResults = content.filter(
    (item) =>
      item.metadata_storage_path &&
      item.metadata_storage_path.includes('english_'),
  );

  if (!filteredResults || !filteredResults.length) {
    return [];
  }

  const results = filteredResults.map((item) => {
    const { content, metadata_storage_path } = item;
    const { chapter, slokaNumber } = extractChapterAndSloka(
      metadata_storage_path,
    );

    return {
      chapter,
      slokaNumber,
      sloka: content || '',
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

/**
 * Extracts chapter and sloka number from the given path.
 * @param {string} path - The path to extract chapter and sloka from.
 * @returns {Object} An object containing chapter and slokaNumber.
 */
function extractChapterAndSloka(path) {
  // Example: "https://slokastorage.blob.core.windows.net/gitaresources/chap19/english_19_21.txt"
  const chapterMatch = path.match(/chap(\d+)/);
  const slokaMatch = path.match(/english_\d+_(\d+)\.txt/);

  return {
    chapter: chapterMatch ? chapterMatch[1] : null,
    slokaNumber: slokaMatch ? slokaMatch[1] : null,
  };
}
// {
//   "@search.score": 8.017582,
//   "id": "aHR0cHM6Ly9zbG9rYXN0b3JhZ2UuYmxvYi5jb3JlLndpbmRvd3MubmV0L2dpdGFyZXNvdXJjZXMvY2hhcDA2L2VuZ2xpc2hfMDZfNDIudHh00",
//   "content": "Athavaa yoginaameva kule bhavati dheemataam;\r\nEtaddhi durlabhataram loke janma yadeedrisham.\r\n",
//   "metadata_storage_path": "https://slokastorage.blob.core.windows.net/gitaresources/chap06/english_06_42.txt"
// },
app.http('slokaSearch', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'slokaSearch',
  handler,
});

module.exports = { handler };
