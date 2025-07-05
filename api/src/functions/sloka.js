const { app } = require('@azure/functions');
const axios = require('axios');
const https = require('https');
const {
  getSlokaResourceUrl,
  validateChapterId,
  validateSlokaId,
} = require('./utils.js');

// Create an HTTPS agent with keep-alive enabled
const httpsAgent = new https.Agent({
  keepAlive: true, // Enable connection reuse
});

// In-memory cache
let cache = new Map();

async function slokaHandler(request, context) {
  try {
    // Extract route parameters from request.params
    const chapterId = request.params.chapterId;
    validateChapterId(chapterId); // Validate chapterId (throws an error if invalid)
    const slokaIndex = request.params.slokaIndex;
    // Extract query parameter for language (default to 'english')
    const content = request.query.get('content') || 'english';
    if (content === 'sanskrit' || content === 'english') {
      validateSlokaId(slokaIndex); // Validate slokaIndex (throws an error if invalid)
    }

    // Fetch content from a remote server using the keep-alive agent
    const remoteUrl = getSlokaResourceUrl(chapterId, slokaIndex, content);
    // Generate a cache key
    let cacheKey = `${remoteUrl}`;

    // Check if the data is already in the cache
    if (cache.has(cacheKey)) {
      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cache.get(cacheKey)), // Return cached data
      };
    }

    const response = await axios.get(remoteUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      httpsAgent, // Pass the keep-alive agent to axios
    });

    const meaningUrl = response.data.meaning_url;

    const meaning = await fetchMeaningContent(meaningUrl);

    delete response.data.meaning_url;
    response.data.meaning = meaning;

    // Cache the response data
    let responseContent = response.data;

    cache.set(cacheKey, responseContent);
    // Return the fetched content
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responseContent),
    };
  } catch (error) {
    // Handle errors (e.g., network issues, server errors)
    context.log(`Error fetching content: ${error}`);
    return {
      status: 400,
      body: {
        error: 'Failed to fetch content from the remote server.',
        details: error.message,
      },
    };
  }

  async function fetchMeaningContent(meaningUrl) {
    if (meaningUrl) {
      // Fetch the meaning content if available
      const meaningResponse = await axios.get(meaningUrl, {
        headers: {
          'Content-Type': 'application/text',
        },
        httpsAgent, // Use the same keep-alive agent
      });
      if (meaningResponse.status !== 200) {
        return `Failed to fetch meaning content: ${meaningResponse.status}`;
      }
      return meaningResponse.data;
    }
  }
}

/**
 * @swagger
 * /sloka/{chapterId}/{slokaIndex}:
 *   get:
 *     summary: Get a specific sloka by chapter and index
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the chapter between 0 and 19
 *       - in: path
 *         name: slokaIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: The index of the sloka
 *       - in: query
 *         name: content
 *         required: false
 *         schema:
 *           type: string
 *           enum: [sanskrit, english, meaning]
 *         description: The language of the sloka content. Default is 'english'.
 *     responses:
 *       200:
 *         description: A sloka object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                   description: The content of the sloka
 */

app.http('sloka', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'sloka/{chapterId}/{slokaIndex}', // Define the route here
  handler: slokaHandler, // Use the named handler function
});

module.exports = { slokaHandler };
