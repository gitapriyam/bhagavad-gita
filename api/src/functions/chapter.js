const { app } = require('@azure/functions');
const axios = require('axios');
const { getSanskritSandhiUrl, validateChapterId } = require('./utils.js');

let cache = new Map();

async function chapterHandler(request, context) {
  const chapterId = request.params.chapterId;
  const query = request.query.get('content');

  try {
    validateChapterId(chapterId);
  } catch (error) {
    return jsonResponse(400, { error: 'Invalid chapter' });
  }

  if (query !== 'sanskrit-sandhi') {
    return jsonResponse(400, {
      error: 'Allowed content values are: sanskrit-sandhi',
    });
  }

  const cacheKey = `${chapterId}-${query}`;
  if (cache.has(cacheKey)) {
    return jsonResponse(200, cache.get(cacheKey));
  }

  try {
    const responseData = await getSanskritSandhiChapter(chapterId);
    cache.set(cacheKey, responseData);
    return jsonResponse(200, responseData);
  } catch (error) {
    context.log(`Error generating chapter content: ${error}`);
    return jsonResponse(500, {
      error: 'Error generating chapter content',
      details: error.message,
    });
  }
}

async function getSanskritSandhiChapter(chapterId) {
  const response = await axios.get(getSanskritSandhiUrl(chapterId), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}

function jsonResponse(status, body) {
  return {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

/**
 * @swagger
 * /{chapterId}:
 *   get:
 *     summary: Get chapter-level content
 *     description: Returns chapter-level Sanskrit sandhi content.
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the chapter.
 *       - in: query
           name: content
 *         required: true
 *         schema:
 *           type: string
 *           enum: [sanskrit-sandhi]
 *     responses:
 *       200:
 *         description: Chapter content.
 *       400:
 *         description: Invalid chapter or content type.
 *       500:
 *         description: Internal server error.
 */
app.http('chapter', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'chapter/{chapterId}',
  handler: chapterHandler,
});

module.exports = {
  chapterHandler,
  cache,
};
