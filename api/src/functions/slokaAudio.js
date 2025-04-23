const { app } = require('@azure/functions');
const { getSlokaAudioUrl, logError, validateChapterId, validateSlokaId } = require('./utils.js');

// In-memory cache
const cache = new Map();

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

app.http('slokaAudio', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'slokaAudio/{chapterId}/{slokaId}', // Updated route to use 'slokaAudio'
    handler: async (request, context) => {
        try {
            const chapterId = request.params.chapterId;
            validateChapterId(chapterId); // Validate chapterId (throws an error if invalid)

            const slokaId = request.params.slokaId;
            validateSlokaId(slokaId); // Validate slokaId (throws an error if invalid)
            // Construct the remote audio URL
            const remoteAudioUrl = getSlokaAudioUrl(chapterId, slokaId);
            const cacheKey = `${remoteAudioUrl}`;

            if (cache.has(cacheKey)) {
                return {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(cache.get(cacheKey)) // Return cached data
                };
            }
            const responseData = { url: remoteAudioUrl };
            cache.set(cacheKey, responseData);
            // Return the audio URL as a JSON response
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(responseData)
            };
        } catch (error) {
            logError(`Error generating audio URL for Chapter ${chapterId}, Sloka ${slokaId}:`, error.message);
            context.res = {
                status: 500,
                body: `Error generating audio URL for Chapter ${chapterId}, Sloka ${slokaId}.`
            };
        }
    }
});
