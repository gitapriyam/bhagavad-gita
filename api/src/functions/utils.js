const remoteResource =
  'https://slokastorage.blob.core.windows.net/gita-app-resources';
const prapattiResource =
  'https://www.prapatti.com/slokas/sanskrit/bhagavad-giitaa/{chapter}.pdf';

/**
 * constructs a remote URL for fetching sloka content.
 * @param {number} chapterId - The chapter ID.
 * @param {number} slokaIndex - The sloka index.
 * @param {string} language - The language (default: 'english').
 * @returns {string} - The constructed URL.
 */

function leftAppendedNumber(input) {
  return String(input).length === 1 ? '0' + input : String(input);
}

function getChapterBasePath(chapterId, content = 'english') {
  let remoteResourceLocal = remoteResource + '/';
  if (content === 'sanskrit' || content === 'sandhi' || content === 'anvaya') {
    remoteResourceLocal = remoteResourceLocal + 'sanskrit';
  } else if (content === 'english' || content === 'meaning') {
    remoteResourceLocal = remoteResourceLocal + 'english';
  } else if (content === 'audio') {
    remoteResourceLocal = remoteResourceLocal + 'common/audio';
  }
  var chapterNumber = leftAppendedNumber(chapterId);
  return remoteResourceLocal + '/chapter-' + chapterNumber + '/';
}

function getSlokaResourceUrl(chapterId, slokaId, content) {
  var slokaIndex = leftAppendedNumber(slokaId);
  const chapterBase = getChapterBasePath(chapterId, content);
  var resourceUrl = null;
  if (content === 'sandhi' || content === 'anvaya' || content === 'meaning') {
    resourceUrl = content + '_' + slokaIndex + '.txt';
  } else {
    resourceUrl = 'sloka_' + slokaIndex + '.json';
  }
  return chapterBase + resourceUrl;
}

function getSlokaGroupUrl(chapterId) {
  return getChapterBasePath(chapterId, 'english') + 'sloka-groups.json';
}

function getChapterName(chapterId) {
  if (Number(chapterId) === 0) {
    return 'dhyanam';
  } else if (Number(chapterId) === 19) {
    return 'mahatmyam';
  }
  return 'chapter_' + leftAppendedNumber(chapterId);
}

function getChapterResource(chapterId, content) {
  // sanskrit is handled here
  if (content === 'sanskrit') {
    var replaceValue = 'bg_chapter' + leftAppendedNumber(chapterId);
    if (Number(chapterId) === 0) {
      replaceValue = 'bg_dhyaanam';
    } else if (Number(chapterId) === 19) {
      replaceValue = 'bg_maahaatmyam';
    }
    return prapattiResource.replace('{chapter}', replaceValue);
  }
  // english is handled here
  var resourceUrl =
    getChapterBasePath(chapterId, 'english') +
    getChapterName(chapterId) +
    '.pdf';
  if (content === 'tamil') {
    resourceUrl = resourceUrl.replace('.pdf', '-tamil.pdf');
  }
  return resourceUrl;
}

function getChaptersUrl() {
  return remoteResource + '/chapters.json';
}

function getChapterAudioUrl(chapterId) {
  return (
    getChapterBasePath(chapterId, 'audio') + getChapterName(chapterId) + '.mp3'
  );
}

/**
 * Logs an error message with additional context.
 * @param {object} context - The Azure Function context object.
 * @param {Error} error - The error object.
 */
function logError(context, error) {
  const logger = context && context.log ? context.log : console.log; // Use context.log if available, otherwise fallback to console.log
  logger('Error:', error.message);
  if (error.response) {
    logger('Response Data:', error.response.data);
    logger('Response Status:', error.response.status);
  }
}

function validateContent(content) {
  var validContents = ['sanskrit', 'english', 'tamil', 'meaning'];
  if (!validContents.includes(content)) {
    throw new Error(
      `Invalid content type. Valid options are: ${validContents.join(', ')}`,
    );
  }
}

function validateSlokaId(slokaId) {
  var slokaIdNumber = parseInt(slokaId, 10);

  // Check if slokaId is not a number or out of range
  if (isNaN(slokaIdNumber)) {
    throw new Error('Invalid slokaId. It must be a positive integer.');
  }
}

/**
 * Validates the chapterId input.
 * @param {string|number} chapterId - The chapter ID to validate.
 * @throws {Error} - Throws an error if the chapterId is invalid.
 */
function validateChapterId(chapterId) {
  var chapterIdNumber = parseInt(chapterId, 10);

  // Check if chapterId is not a number or out of range
  if (isNaN(chapterIdNumber) || chapterIdNumber < 0 || chapterIdNumber > 19) {
    throw new Error(
      'Invalid chapterId. It must be a positive integer between 0 and 19.',
    );
  }
}

module.exports = {
  getSlokaResourceUrl,
  getSlokaGroupUrl,
  getChapterResource,
  getChapterAudioUrl,
  getChaptersUrl,
  logError,
  validateContent,
  validateSlokaId,
  validateChapterId,
};
