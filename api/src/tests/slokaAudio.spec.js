/* global jest, describe, it, expect, beforeEach */
const utils = require('../functions/utils.js');
const handlerModule = require('../functions/slokaAudio.js');
const { slokaAudioHandler: handler } = handlerModule;

jest.mock('../functions/utils.js', () => ({
  getSlokaAudioUrl: jest.fn(),
  logError: jest.fn(),
  validateChapterId: jest.fn(),
  validateSlokaId: jest.fn(),
}));

require('../functions/slokaAudio.js');

describe('slokaAudio Azure Function', () => {
  let context;

  beforeEach(() => {
    jest.clearAllMocks();
    handlerModule.cache.clear();
    context = { log: jest.fn() };
  });

  it('should return 400 for invalid chapterId', async () => {
    utils.validateChapterId.mockImplementation(() => {
      throw new Error('Invalid chapter');
    });

    const request = { params: { chapterId: 'abc', slokaId: '1' } };
    const result = await handler(request, context);

    expect(result.status).toBe(400);
    expect(result.body).toContain('Invalid sloka audio request');
    expect(context.log).toHaveBeenCalledWith(
      'Invalid sloka audio request: chapterId=abc, slokaId=1',
    );
  });

  it('should return 400 for invalid slokaId', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.validateSlokaId.mockImplementation(() => {
      throw new Error('Invalid sloka');
    });

    const request = { params: { chapterId: '1', slokaId: 'abc' } };
    const result = await handler(request, context);

    expect(result.status).toBe(400);
    expect(result.body).toContain('Invalid sloka audio request');
  });

  it('should return 200 and audio URL for valid ids', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.validateSlokaId.mockImplementation(() => {});
    utils.getSlokaAudioUrl.mockReturnValue('https://audio.url/ch1/sloka2.mp3');

    const request = { params: { chapterId: '1', slokaId: '2' } };
    const result = await handler(request, context);

    expect(result.status).toBe(200);
    expect(result.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(result.body)).toEqual({
      url: 'https://audio.url/ch1/sloka2.mp3',
    });
  });

  it('should return cached response if available', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.validateSlokaId.mockImplementation(() => {});
    utils.getSlokaAudioUrl.mockReturnValue('https://audio.url/ch1/sloka3.mp3');

    const request = { params: { chapterId: '1', slokaId: '3' } };
    await handler(request, context);
    const result = await handler(request, context);

    expect(result.status).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      url: 'https://audio.url/ch1/sloka3.mp3',
    });
    expect(utils.getSlokaAudioUrl).toHaveBeenCalledTimes(2);
  });

  it('should return 500 if getSlokaAudioUrl throws', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.validateSlokaId.mockImplementation(() => {});
    utils.getSlokaAudioUrl.mockImplementation(() => {
      throw new Error('URL error');
    });

    const request = { params: { chapterId: '3', slokaId: '4' } };
    const result = await handler(request, context);

    expect(result.status).toBe(500);
    expect(result.body).toContain(
      'Error generating audio URL for Chapter 3, Sloka 4.',
    );
    expect(utils.logError).toHaveBeenCalled();
  });
});
