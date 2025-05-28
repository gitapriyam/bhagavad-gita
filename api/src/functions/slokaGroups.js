const { app } = require('@azure/functions');
const axios = require('axios');
const { getSlokaGroupUrl, logError, validateChapterId } = require('./utils.js');
const https = require('https');

// In-memory cache
let cache = new Map();

// Create an HTTPS agent with keep-alive enabled
const httpsAgent = new https.Agent({
  keepAlive: true, // Enable connection reuse
});

async function slokaGroupHandler(request, context) {
  try {
    const chapterId = request.params.chapterId;
    validateChapterId(chapterId); // Validate chapterId (throws an error if invalid)

    const remoteResourceUrl = getSlokaGroupUrl(chapterId);

    // Generate a cache key
    let cacheKey = `${remoteResourceUrl}`;
    // Check if the data is already in the cache
    if (cache.has(cacheKey)) {
      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cache.get(cacheKey).content), // Return cached data
      };
    }

    const response = await axios.get(remoteResourceUrl, {
      httpsAgent, // Pass the keep-alive agent to axios
    });

    // Cache the response data
    const responseData = { content: response.data };
    cache.set(cacheKey, responseData);

    context.log(`Response from remote server: ${response.data}`);

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responseData.content), // Serialize the body to JSON
    };
  } catch (error) {
    logError(context, `Error fetching data from remote server: error.message`);
    return {
      status: 500,
      body: {
        error: 'Failed to fetch content from the remote server.',
        details: error.message,
      },
    };
  }
}
/**
 * @swagger
 * /slokaGroups/{chapterId}:
 *   get:
 *     summary: Get the sloka grouping for a specific chapter
 *     description: In Sanskrit, a group of slokas together convey the meaning intended by the author. This API returns the sloka grouping for the specified chapter of the Bhagavad Gita.
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the chapter (e.g., 1 for Chapter 1).
 *     responses:
 *       200:
 *         description: A JSON object containing the audio URL for the chapter.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 readiness:
 *                   type: object
 *                   properties:
 *                     development:
 *                       type: boolean
 *                       description: Indicates if the chapter is in development.
 *                       example: true
 *                     production:
 *                       type: boolean
 *                       description: Indicates if the chapter is in production.
 *                       example: false
 *                 groups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       groupId:
 *                         type: integer
 *                         description: The ID of the sloka group.
 *                       slokas:
 *                          type: array
 *                          items:
 *                            type: integer
 *                            description: The ID of the sloka.
 *                            example: [1, 2, 3]
 *       400:
 *         description: Invalid chapter ID.
 *       500:
 *         description: Internal server error.
 */
app.http('slokaGroups', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'slokaGroups/{chapterId}', // Updated route to use 'slokaGroups'
  handler: slokaGroupHandler,
});

module.exports = { slokaGroupHandler };
