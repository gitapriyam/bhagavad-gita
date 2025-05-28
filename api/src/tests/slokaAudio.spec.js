/* global jest, describe, it, expect, beforeEach */
const utils = require('../functions/utils.js');

// Mock utility functions
jest.mock('../functions/utils.js', () => ({
  getSlokaAudioUrl: jest.fn(),
  logError: jest.fn(),
  validateChapterId: jest.fn(),
  validateSlokaId: jest.fn(),
}));

// Import the function file to register the handler
require('../functions/slokaAudio.js');

// Helper to extract the handler from app.http registration
require('@azure/functions');

const { slokaAudioHandler: handler } = require('../functions/slokaAudio.js');

describe('slokaAudio Azure Function', () => {
  let context;

  beforeEach(() => {
    jest.clearAllMocks();
    context = { log: jest.fn() };
  });

  it('should return 200 and audio URL for valid chapterId and slokaId', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.validateSlokaId.mockImplementation(() => {});
    utils.getSlokaAudioUrl.mockReturnValue('https://audio.url/ch1s1.mp3');

    const request = {
      params: { chapterId: 1, slokaId: 1 },
    };
    const result = await handler(request, context);

    expect(result.status).toBe(200);
    expect(result.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(result.body)).toEqual({
      url: 'https://audio.url/ch1s1.mp3',
    });
  });

  it('should return cached response if available', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.validateSlokaId.mockImplementation(() => {});
    utils.getSlokaAudioUrl.mockReturnValue('https://audio.url/ch2s2.mp3');

    const request = {
      params: { chapterId: 2, slokaId: 2 },
    };
    // First call to populate cache
    await handler(request, context);
    // Second call should hit cache
    const result = await handler(request, context);

    expect(result.status).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      url: 'https://audio.url/ch2s2.mp3',
    });
  });

  it('should return 500 if chapterId is invalid', async () => {
    utils.validateChapterId.mockImplementation(() => {
      throw new Error('Invalid chapterId');
    });

    const request = {
      params: { chapterId: 'abc', slokaId: 1 },
    };
    const result = await handler(request, context);

    expect(result.status).toBe(500);
    expect(result.body).toContain(
      'Error generating audio URL for Chapter abc, Sloka 1.',
    );
    expect(utils.logError).toHaveBeenCalled();
  });

  it('should return 500 if slokaId is invalid', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.validateSlokaId.mockImplementation(() => {
      throw new Error('Invalid slokaId');
    });

    const request = {
      params: { chapterId: 1, slokaId: 'xyz' },
    };
    const result = await handler(request, context);

    expect(result.status).toBe(500);
    expect(result.body).toContain(
      'Error generating audio URL for Chapter 1, Sloka xyz.',
    );
    expect(utils.logError).toHaveBeenCalled();
  });

  it('should return 500 if getSlokaAudioUrl throws', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.validateSlokaId.mockImplementation(() => {});
    utils.getSlokaAudioUrl.mockImplementation(() => {
      throw new Error('URL error');
    });

    const request = {
      params: { chapterId: 3, slokaId: 3 },
    };
    const result = await handler(request, context);

    expect(result.status).toBe(500);
    expect(result.body).toContain(
      'Error generating audio URL for Chapter 3, Sloka 3.',
    );
    expect(utils.logError).toHaveBeenCalled();
  });
});
