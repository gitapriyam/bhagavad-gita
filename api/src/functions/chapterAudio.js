const app = require('@azure/functions').app;
const utils = require('./utils.js');
const getChapterAudioUrl = utils.getChapterAudioUrl;
const logError = utils.logError;
const validateChapterId = utils.validateChapterId;

// In-memory cache
let cache = new Map();

// Define the handler as a named async function
async function chapterAudioHandler(request, context) {
  let chapterId;
  try {
    chapterId = request.params.chapterId;
    validateChapterId(chapterId); // Validate chapterId (throws an error if invalid)
  } catch (error) {
    context.log(`Invalid chapter ID: ${chapterId}`);
    return {
      status: 400,
      body: `Invalid chapter ID: ${chapterId}`,
    };
  }

  try {
    // Construct the remote audio URL
    const remoteAudioUrl = getChapterAudioUrl(chapterId);
    // Generate a cache key
    const cacheKey = `${remoteAudioUrl}`;
    // Return the audio URL as a JSON response
    if (cache.has(cacheKey)) {
      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cache.get(cacheKey)), // Return cached data
      };
    }
    const responseData = { url: remoteAudioUrl };
    cache.set(cacheKey, responseData);

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responseData),
    };
  } catch (error) {
    context.log(
      `Error generating audio URL for Chapter ${chapterId}: ${error}`,
    );
    logError(
      `Error generating audio URL for Chapter ${chapterId}`,
      error.message,
    );
    return {
      status: 500,
      body: `Error generating audio URL for Chapter ${chapterId}.`,
    };
  }
}

/**
 * @swagger
 * /chapterAudio/{chapterId}:
 *   get:
 *     summary: Get the audio URL for a specific chapter
 *     description: Returns the audio URL for the specified chapter of the Bhagavad Gita.
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
 *                 url:
 *                   type: string
 *                   description: The URL of the chapter audio.
 *                   example: "https://example.com/audio/chapter1.mp3"
 *       400:
 *         description: Invalid chapter ID.
 *       500:
 *         description: Internal server error.
 */
app.http('chapterAudio', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'chapterAudio/{chapterId}',
  handler: chapterAudioHandler, // Use the named handler function
});

// Export the handler for testing
module.exports = { chapterAudioHandler };
