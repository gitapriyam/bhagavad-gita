const { app } = require('@azure/functions');
const { getChapterResource, logError, validateChapterId, validateContent } = require('./utils.js');

// In-memory cache
const cache = new Map();

/**
 * @swagger
 * /chapterResource/{chapterId}:
 *   get:
 *     summary: Get the chapter PDF resource URL for a specific chapter
 *     description: Returns the chapter PDF resource URL for the specified chapter of the Bhagavad Gita.
 *     parameters:
 *     - in: path
 *       name: chapterId
 *       required: true
 *       schema:
 *         type: integer
 *       description: The ID of the chapter (e.g., 1 for Chapter 1).
 *     - in: query
 *       name: content
 *       required: false
 *       schema:
 *        type: string
 *        enum: [sanskrit, english, tamil]
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
 *                   description: The URL of the chapter resource.
 *       400:
 *         description: Invalid chapter ID.
 *       500:
 *         description: Internal server error.
 */

app.http('chapterResource', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'chapterResource/{chapterId}',
    handler: async (request, context) => {
        try {
            // Extract route parameters from request.params
            const chapterId = request.params.chapterId;
            validateChapterId(chapterId)
            // Extract query parameter for language (default to 'english')
            const content = request.query.get('content') || 'english';
            validateContent(content); // Validate content (throws an error if invalid)

            remoteUrl = getChapterResource(chapterId, content);
            
            const cacheKey = `${remoteUrl}`;
            
            if (cache.has(cacheKey)) {
                return {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(cache.get(cacheKey)) // Return cached data
                };
            }

            const responseData = { url: remoteUrl };
            cache.set(cacheKey, responseData);

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json' // Explicitly set Content-Type to JSON
                },
                body: JSON.stringify(responseData) // Serialize the body to JSON
            };
        } catch (error) {
            // Handle errors (e.g., network issues, server errors)
            context.log(`Error generation PDF URL: ${error}`);
            logError('Error generation PDF URL', error.message);
            return {
                status: 500,
                body: {
                    error: 'Error generation PDF URL.',
                    details: error.message
                }
            };
        }

        return { body: `Hello, ${name}!` };
    }
});
