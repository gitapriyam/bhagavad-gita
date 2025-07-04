/* global jest, describe, it, expect, beforeEach */
const utils = require('../functions/utils.js');
const {
  chapterAudioHandler: handler,
} = require('../functions/chapterAudio.js');

// Mock utility functions
jest.mock('../functions/utils.js', () => ({
  getChapterAudioUrl: jest.fn(),
  logError: jest.fn(),
  validateChapterId: jest.fn(),
}));

// Import the function file to register the handler
require('../functions/chapterAudio.js');

describe('chapterAudio Azure Function', () => {
  let context;

  beforeEach(() => {
    jest.clearAllMocks();
    context = { log: jest.fn() };
  });

  it('should return 400 for invalid chapterId', async () => {
    utils.validateChapterId.mockImplementation(() => {
      throw new Error('Invalid');
    });

    const request = { params: { chapterId: 'abc' } };
    const result = await handler(request, context);

    expect(result.status).toBe(400);
    expect(result.body).toContain('Invalid chapter ID');
    expect(context.log).toHaveBeenCalledWith('Invalid chapter ID: abc');
  });

  it('should return 200 and audio URL for valid chapterId', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.getChapterAudioUrl.mockReturnValue('https://audio.url/ch1.mp3');

    const request = { params: { chapterId: 1 } };
    const result = await handler(request, context);

    expect(result.status).toBe(200);
    expect(result.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(result.body)).toEqual({
      url: 'https://audio.url/ch1.mp3',
    });
  });

  it('should return cached response if available', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.getChapterAudioUrl.mockReturnValue('https://audio.url/ch2.mp3');

    const request = { params: { chapterId: 2 } };
    // First call to populate cache
    await handler(request, context);
    // Second call should hit cache
    const result = await handler(request, context);

    expect(result.status).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      url: 'https://audio.url/ch2.mp3',
    });
  });

  it('should return 500 if getChapterAudioUrl throws', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.getChapterAudioUrl.mockImplementation(() => {
      throw new Error('URL error');
    });

    const request = { params: { chapterId: 3 } };
    const result = await handler(request, context);

    expect(result.status).toBe(500);
    expect(result.body).toContain('Error generating audio URL for Chapter 3.');
    expect(utils.logError).toHaveBeenCalled();
  });
});
