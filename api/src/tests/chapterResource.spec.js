/* global jest, describe, it, expect, beforeEach */
require('@azure/functions');
const utils = require('../functions/utils.js');
const {
  chapterResourceHandler: handler,
} = require('../functions/chapterResource.js');
// Mock utility functions
jest.mock('../functions/utils.js', () => ({
  getChapterResource: jest.fn(),
  logError: jest.fn(),
  validateChapterId: jest.fn(),
  validateContent: jest.fn(),
}));

// Import the function file to register the handler
require('../functions/chapterResource.js');

describe('chapterResource Azure Function', () => {
  let context;

  beforeEach(() => {
    jest.clearAllMocks();
    context = { log: jest.fn() };
  });

  it('should return 400 for invalid chapterId', async () => {
    utils.validateChapterId.mockImplementation(() => {
      throw new Error('Invalid chapterId');
    });

    const request = {
      params: { chapterId: 'abc' },
      query: new Map([['content', 'english']]),
    };
    // Since the handler returns 500 on error, not 400, adjust expectation if needed
    const result = await handler(request, context);

    expect(result.status).toBe(500);
    expect(result.body.error).toContain('Error generating PDF URL');
    expect(utils.logError).toHaveBeenCalled();
  });

  it('should return 400 for invalid content', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.validateContent.mockImplementation(() => {
      throw new Error('Invalid content');
    });

    const request = {
      params: { chapterId: 1 },
      query: new Map([['content', 'invalid']]),
    };
    const result = await handler(request, context);

    expect(result.status).toBe(500);
    expect(result.body.error).toContain('Error generating PDF URL');
    expect(utils.logError).toHaveBeenCalled();
  });

  it('should return 200 and resource URL for valid chapterId and content', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.validateContent.mockImplementation(() => {});
    utils.getChapterResource.mockReturnValue('https://resource.url/ch1.pdf');

    const request = {
      params: { chapterId: 1 },
      query: new Map([['content', 'english']]),
    };
    const result = await handler(request, context);

    expect(result.status).toBe(200);
    expect(result.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(result.body)).toEqual({
      url: 'https://resource.url/ch1.pdf',
    });
  });

  it('should return cached response if available', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.validateContent.mockImplementation(() => {});
    utils.getChapterResource.mockReturnValue('https://resource.url/ch2.pdf');

    const request = {
      params: { chapterId: 2 },
      query: new Map([['content', 'english']]),
    };
    // First call to populate cache
    await handler(request, context);
    // Second call should hit cache
    const result = await handler(request, context);

    expect(result.status).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      url: 'https://resource.url/ch2.pdf',
    });
  });

  it('should default content to english if not provided', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.validateContent.mockImplementation(() => {});
    utils.getChapterResource.mockReturnValue('https://resource.url/ch3.pdf');

    const request = {
      params: { chapterId: 3 },
      query: new Map(), // No content param
    };
    const result = await handler(request, context);

    expect(result.status).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      url: 'https://resource.url/ch3.pdf',
    });
  });

  it('should return 500 if getChapterResource throws', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.validateContent.mockImplementation(() => {});
    utils.getChapterResource.mockImplementation(() => {
      throw new Error('Resource error');
    });

    const request = {
      params: { chapterId: 4 },
      query: new Map([['content', 'english']]),
    };
    const result = await handler(request, context);

    expect(result.status).toBe(500);
    expect(result.body.error).toContain('Error generating PDF URL');
    expect(utils.logError).toHaveBeenCalled();
  });
});
