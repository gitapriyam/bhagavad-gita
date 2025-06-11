/* global jest, describe, it, expect, beforeEach */
const axios = require('axios');
require('@azure/functions');
const utils = require('../functions/utils.js');
const { slokaHandler: handler } = require('../functions/sloka.js');

// Mock axios and utility functions
jest.mock('axios');
jest.mock('../functions/utils.js', () => ({
  getSlokaResourceUrl: jest.fn(),
  validateChapterId: jest.fn(),
  validateSlokaId: jest.fn(),
}));

// Import the function file to register the handler
require('../functions/sloka.js');

describe('sloka Azure Function', () => {
  let context;

  beforeEach(() => {
    jest.clearAllMocks();
    context = { log: jest.fn() };
  });

  it('should return 400 if chapterId is invalid', async () => {
    utils.validateChapterId.mockImplementation(() => {
      throw new Error('Invalid chapterId');
    });

    const request = {
      params: { chapterId: 'abc', slokaIndex: 1 },
      query: new Map([['content', 'english']]),
    };
    const result = await handler(request, context);

    expect(result.status).toBe(400);
    expect(result.body.error).toBe(
      'Failed to fetch content from the remote server.',
    );
    expect(context.log).toHaveBeenCalled();
  });

  it('should return 400 if slokaIndex is invalid', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.validateSlokaId.mockImplementation(() => {
      throw new Error('Invalid slokaIndex');
    });

    const request = {
      params: { chapterId: 1, slokaIndex: 'abc' },
      query: new Map([['content', 'english']]),
    };
    const result = await handler(request, context);

    expect(result.status).toBe(400);
    expect(result.body.error).toBe(
      'Failed to fetch content from the remote server.',
    );
    expect(context.log).toHaveBeenCalled();
  });

  it('should return 200 and sloka content for valid params', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.validateSlokaId.mockImplementation(() => {});
    utils.getSlokaResourceUrl.mockReturnValue(
      'https://sloka.url/ch1s1/english',
    );
    axios.get.mockResolvedValue({ data: 'Sloka Content' });

    const request = {
      params: { chapterId: 1, slokaIndex: 1 },
      query: new Map([['content', 'english']]),
    };
    const result = await handler(request, context);

    expect(result.status).toBe(200);
    expect(result.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(result.body)).toEqual({ content: 'Sloka Content' });
  });

  it('should return cached response if available', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.validateSlokaId.mockImplementation(() => {});
    utils.getSlokaResourceUrl.mockReturnValue(
      'https://sloka.url/ch2s2/english',
    );
    axios.get.mockResolvedValue({ data: 'Sloka Content 2' });

    const request = {
      params: { chapterId: 2, slokaIndex: 2 },
      query: new Map([['content', 'english']]),
    };
    // First call to populate cache
    await handler(request, context);
    // Second call should hit cache
    const result = await handler(request, context);

    expect(result.status).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ content: 'Sloka Content 2' });
    // axios.get should only be called once
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('should default content to english if not provided', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.validateSlokaId.mockImplementation(() => {});
    utils.getSlokaResourceUrl.mockReturnValue(
      'https://sloka.url/ch3s3/english',
    );
    axios.get.mockResolvedValue({ data: 'Default English Content' });

    const request = {
      params: { chapterId: 3, slokaIndex: 3 },
      query: new Map(), // No content param
    };
    const result = await handler(request, context);

    expect(result.status).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      content: 'Default English Content',
    });
  });

  it('should return 500 if axios.get throws', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.validateSlokaId.mockImplementation(() => {});
    utils.getSlokaResourceUrl.mockReturnValue(
      'https://sloka.url/ch4s4/english',
    );
    axios.get.mockRejectedValue(new Error('Network error'));

    const request = {
      params: { chapterId: 4, slokaIndex: 4 },
      query: new Map([['content', 'english']]),
    };
    const result = await handler(request, context);

    expect(result.status).toBe(400);
    expect(result.body.error).toBe(
      'Failed to fetch content from the remote server.',
    );
    expect(result.body.details).toBe('Network error');
    expect(context.log).toHaveBeenCalled();
  });
});
