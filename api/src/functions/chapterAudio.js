const { app } = require('@azure/functions');
const { getChapterAudioURL,logError, validateChapterId } = require('./utils.js');

// In-memory cache
const cache = new Map();

app.http('chapterAudio', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'chapterAudio/{chapterId}', 
    handler: async (request, context) => {
        try {
            const chapterId = request.params.chapterId;
            validateChapterId(chapterId); // Validate chapterId (throws an error if invalid)
        
            // Construct the remote audio URL
            const remoteAudioUrl = getChapterAudioURL(chapterId);
            // Generate a cache key
            const cacheKey = `${remoteAudioUrl}`;
            // Return the audio URL as a JSON response
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
            
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(responseData)
            };
        } catch (error) {
            context.log(`Error generating audio URL for Chapter ${chapterId}: ${error}`);
            logError(`Error generating audio URL for Chapter ${chapterId}`, error.message);
            context.res = {
                status: 500,
                body: `Error generating audio URL for Chapter ${chapterId}.`
            };
        }
    }
});
