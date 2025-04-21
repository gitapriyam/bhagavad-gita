const { app } = require('@azure/functions');
const axios = require('axios');
const { getSlokaGroupUrl, logError, validateChapterId } = require('./utils.js');
const https = require('https');

// In-memory cache
const cache = new Map();

// Create an HTTPS agent with keep-alive enabled
const httpsAgent = new https.Agent({
    keepAlive: true // Enable connection reuse
});

app.http('slokaGroups', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'slokaGroups/{chapterId}', // Updated route to use 'slokaGroups'
    handler: async (request, context) => {
        try {
            const chapterId = request.params.chapterId;
            validateChapterId(chapterId); // Validate chapterId (throws an error if invalid)
        
            const remoteResourceUrl = getSlokaGroupUrl(chapterId);
            
            // Generate a cache key
            const cacheKey = `${remoteResourceUrl}`;
            // Check if the data is already in the cache
            if (cache.has(cacheKey)) {
                return {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(cache.get(cacheKey).content) // Return cached data
                };
            }

            const response = await axios.get(remoteResourceUrl, {
                httpsAgent // Pass the keep-alive agent to axios
            });
            
            // Cache the response data
            const responseData = { content: response.data };
            cache.set(cacheKey, responseData);

            context.log(`Response from remote server: ${response.data}`);
            
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(responseData.content) // Serialize the body to JSON
            };
        } catch (error) {
            logError('Error fetching data from remote server:', error.message);
            return {
                status: 500,
                body: {
                    error: 'Failed to fetch content from the remote server.',
                    details: error.message
                }
            }
        }
    }
});


