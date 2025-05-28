/* global jest, describe, it, expect, beforeEach */
const axios = require('axios');
const utils = require('../functions/utils.js');

// Mock axios and utility functions
jest.mock('axios');
jest.mock('../functions/utils.js', () => ({
  getSlokaGroupUrl: jest.fn(),
  logError: jest.fn(),
  validateChapterId: jest.fn(),
}));

// Import the function file to register the handler
require('../functions/slokaGroups.js');

// Import the Azure Functions app to extract the handler
require('@azure/functions');

// Helper to extract the handler from app.http registration
const { slokaGroupHandler: handler } = require('../functions/slokaGroups.js');

describe('slokaGroups Azure Function', () => {
  let context;

  beforeEach(() => {
    jest.clearAllMocks();
    context = { log: jest.fn() };
  });

  it('should return 200 and sloka groups for valid chapterId', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.getSlokaGroupUrl.mockReturnValue(
      'https://api.example.com/slokaGroups/1',
    );
    axios.get.mockResolvedValue({
      data: { groups: [{ groupId: 1, slokas: [1, 2, 3] }] },
    });

    const request = {
      params: { chapterId: 1 },
    };
    const result = await handler(request, context);

    expect(result.status).toBe(200);
    expect(result.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(result.body)).toEqual({
      groups: [{ groupId: 1, slokas: [1, 2, 3] }],
    });
  });

  it('should return cached response if available', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.getSlokaGroupUrl.mockReturnValue(
      'https://api.example.com/slokaGroups/2',
    );
    axios.get.mockResolvedValue({
      data: { groups: [{ groupId: 2, slokas: [4, 5] }] },
    });

    const request = {
      params: { chapterId: 2 },
    };
    // First call to populate cache
    await handler(request, context);
    // Second call should hit cache
    const result = await handler(request, context);

    expect(result.status).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      groups: [{ groupId: 2, slokas: [4, 5] }],
    });
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('should return 500 if chapterId is invalid', async () => {
    utils.validateChapterId.mockImplementation(() => {
      throw new Error('Invalid chapterId');
    });

    const request = {
      params: { chapterId: 'abc' },
    };
    const result = await handler(request, context);

    expect(result.status).toBe(500);
    expect(result.body.error).toBe(
      'Failed to fetch content from the remote server.',
    );
    expect(utils.logError).toHaveBeenCalled();
  });

  it('should return 500 if axios.get throws', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.getSlokaGroupUrl.mockReturnValue(
      'https://api.example.com/slokaGroups/3',
    );
    axios.get.mockRejectedValue(new Error('Network error'));

    const request = {
      params: { chapterId: 3 },
    };
    const result = await handler(request, context);

    expect(result.status).toBe(500);
    expect(result.body.error).toBe(
      'Failed to fetch content from the remote server.',
    );
    expect(result.body.details).toBe('Network error');
    expect(utils.logError).toHaveBeenCalled();
  });
});
