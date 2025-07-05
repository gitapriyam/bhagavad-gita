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

async function slokaResourceHandler(request) {
  const { chapterId, slokaId } = request.params;

  // Validate input
  try {
    validateChapterId(chapterId);
  } catch (error) {
    return {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Invalid chapterId' }),
    };
  }

  const content = request.query.get('content');
  if (content !== 'sandhi' && content !== 'anvaya' && content !== 'meaning') {
    return {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Allowed content values are: sandhi, anvaya or meaning',
      }),
    };
  }
  if (content === 'meaning') {
    try {
      validateSlokaId(slokaId);
    } catch (error) {
      return {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'slokaId must be a positive integer' }),
      };
    }
  }
  // Check cache
  const cacheKey = `${content}-${chapterId}-${slokaId}`;
  // Check if the data is already in the cache
  if (cache.has(cacheKey)) {
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: cache.get(cacheKey) }), // Return cached data
    };
  }
  try {
    const url = getSlokaResourceUrl(chapterId, slokaId, content);

    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
      httpsAgent, // Pass the keep-alive agent to axios
    };

    const response = await axios.get(url, axiosConfig);
    cache.set(cacheKey, response.data);

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: response.data }),
    };
  } catch (error) {
    return {
      status: 400,
      body: JSON.stringify({ error: 'Error fetching resource' }),
    };
  }
}

app.http('slokaResource', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'slokaResource/{chapterId}/{slokaId}',
  handler: slokaResourceHandler,
});

module.exports = {
  slokaResourceHandler,
  cache,
};
