const { app } = require('@azure/functions');
const axios = require('axios');
const https = require('https');
const { getSlokaResourceUrl, validateChapterId, validateSlokaId } = require('./utils.js');

// Create an HTTPS agent with keep-alive enabled
const httpsAgent = new https.Agent({
    keepAlive: true // Enable connection reuse
});

// In-memory cache
const cache = new Map();

app.http('sloka', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'sloka/{chapterId}/{slokaIndex}', // Define the route here
    handler: async (request, context) => {
        try {
            // Extract route parameters from request.params
            const chapterId = request.params.chapterId;
            validateChapterId(chapterId); // Validate chapterId (throws an error if invalid)
            const slokaIndex = request.params.slokaIndex;
            validateSlokaId(slokaIndex); // Validate slokaIndex (throws an error if invalid)

            // Extract query parameter for language (default to 'english')
            const content = request.query.get('content') || 'english';
            // Fetch content from a remote server using the keep-alive agent
            const remoteUrl = getSlokaResourceUrl(chapterId, slokaIndex, content);
            // Generate a cache key
            const cacheKey = `${remoteUrl}`;

            // Check if the data is already in the cache
            if (cache.has(cacheKey)) {
                return {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(cache.get(cacheKey)) // Return cached data
                };
            }


            const response = await axios.get(remoteUrl, {
                httpsAgent // Pass the keep-alive agent to axios
            });

            // Cache the response data
            const responseData = { content: response.data };
            cache.set(cacheKey, responseData);

            // Return the fetched content
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(responseData)
            };
        } catch (error) {
            // Handle errors (e.g., network issues, server errors)
            context.log(`Error fetching content: ${error}`);
            return {
                status: 500,
                body: {
                    error: 'Failed to fetch content from the remote server.',
                    details: error.message
                }
            };
        }
    }
});
