const app = require('@azure/functions').app;
const utils = require('./utils.js');
const getSlokaAudioUrl = utils.getSlokaAudioUrl;
const logError = utils.logError;
const validateChapterId = utils.validateChapterId;
const validateSlokaId = utils.validateSlokaId;

let cache = new Map();

async function slokaAudioHandler(request, context) {
  let chapterId;
  let slokaId;

  try {
    chapterId = request.params.chapterId;
    slokaId = request.params.slokaId;
    validateChapterId(chapterId);
    validateSlokaId(slokaId);
  } catch (error) {
    context.log(
      `Invalid sloka audio request: chapterId=${chapterId}, slokaId=${slokaId}`,
    );
    return {
      status: 400,
      body: `Invalid sloka audio request: chapterId=${chapterId}, slokaId=${slokaId}`,
    };
  }

  try {
    const remoteAudioUrl = getSlokaAudioUrl(chapterId, slokaId);
    const cacheKey = `${remoteAudioUrl}`;

    if (cache.has(cacheKey)) {
      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cache.get(cacheKey)),
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
      `Error generating audio URL for Chapter ${chapterId}, Sloka ${slokaId}: ${error}`,
    );
    logError(
      `Error generating audio URL for Chapter ${chapterId}, Sloka ${slokaId}`,
      error,
    );
    return {
      status: 500,
      body: `Error generating audio URL for Chapter ${chapterId}, Sloka ${slokaId}.`,
    };
  }
}

/**
 * @swagger
 * /slokaAudio/{chapterId}/{slokaId}:
 *   get:
 *     summary: Get the audio URL for a specific chapter sloka
 *     description: Returns the audio URL for the specified chapter's sloka of the Bhagavad Gita.
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the chapter (e.g., 1 for Chapter 1).
 *       - in: path
 *         name: slokaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the sloka (e.g., 1 for Sloka 1).
 *     responses:
 *       200:
 *         description: A JSON object containing the audio URL for the sloka.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: The URL of the sloka audio.
 *                   example: "https://example.com/audio/sloka1.mp3"
 *       400:
 *         description: Invalid chapter or sloka ID.
 *       500:
 *         description: Internal server error.
 */
app.http('slokaAudio', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'slokaAudio/{chapterId}/{slokaId}',
  handler: slokaAudioHandler,
});

module.exports = { slokaAudioHandler, cache };
