/* global jest, describe, it, expect, beforeEach, afterEach */
const axios = require('axios');
const handlerModule = require('../functions/slokaResource.js');
const utils = require('../functions/utils.js');

describe('slokaResourceHandler', () => {
  let getSlokaResourceUrlSpy, validateChapterIdSpy, validateSlokaIdSpy;

  beforeEach(() => {
    getSlokaResourceUrlSpy = jest.spyOn(utils, 'getSlokaResourceUrl');
    validateChapterIdSpy = jest.spyOn(utils, 'validateChapterId');
    validateSlokaIdSpy = jest.spyOn(utils, 'validateSlokaId');
    jest.clearAllMocks();
    if (handlerModule.cache) handlerModule.cache.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks && jest.restoreAllMocks();
  });

  it('should return 400 for invalid chapterId', async () => {
    validateChapterIdSpy.mockReturnValue(true);
    const req = {
      params: { chapterId: 'x', slokaId: '1' },
      query: new Map([['content', 'sandhi']]),
    };
    const res = await handlerModule.slokaResourceHandler(req);
    expect(res.status).toBe(400);
    expect(JSON.parse(res.body).error).toBe('Invalid chapterId');
  });

  it('should return 400 for invalid content', async () => {
    validateChapterIdSpy.mockReturnValue(false);
    const req = {
      params: { chapterId: '1', slokaId: '1' },
      query: new Map([['content', 'invalid']]),
    };
    const res = await handlerModule.slokaResourceHandler(req);
    expect(res.status).toBe(400);
    expect(JSON.parse(res.body).error).toMatch(/Allowed content values/);
  });

  it('should return 400 for invalid slokaId when content is meaning', async () => {
    validateChapterIdSpy.mockReturnValue(false);
    validateSlokaIdSpy.mockReturnValue(false);
    const req = {
      params: { chapterId: '1', slokaId: 'x' },
      query: new Map([['content', 'meaning']]),
    };
    const res = await handlerModule.slokaResourceHandler(req);
    expect(res.status).toBe(400);
    expect(JSON.parse(res.body).error).toBe(
      'slokaId must be a positive integer',
    );
  });

  it('should return cached data if present', async () => {
    validateChapterIdSpy.mockReturnValue(false);
    validateSlokaIdSpy.mockReturnValue(true);
    const req = {
      params: { chapterId: '1', slokaId: '2' },
      query: new Map([['content', 'sandhi']]),
    };
    const cacheKey = 'sandhi-1-2';
    handlerModule.cache.set(cacheKey, 'cachedData');
    const res = await handlerModule.slokaResourceHandler(req);
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body).content).toBe('cachedData');
  });

  it('should fetch and cache data if not cached', async () => {
    validateChapterIdSpy.mockReturnValue(false);
    validateSlokaIdSpy.mockReturnValue(true);
    getSlokaResourceUrlSpy.mockReturnValue('http://test.url');
    jest.spyOn(axios, 'get').mockResolvedValue({ data: 'fetchedData' });
    const req = {
      params: { chapterId: '1', slokaId: '2' },
      query: new Map([['content', 'sandhi']]),
    };
    handlerModule.cache.clear();
    const res = await handlerModule.slokaResourceHandler(req);
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body).content).toBe('fetchedData');
  });

  it('should return 400 on fetch error', async () => {
    validateChapterIdSpy.mockReturnValue(false);
    validateSlokaIdSpy.mockReturnValue(true);
    getSlokaResourceUrlSpy.mockReturnValue('http://test.url');
    jest.spyOn(axios, 'get').mockRejectedValue(new Error('fail'));
    const req = {
      params: { chapterId: '1', slokaId: '2' },
      query: new Map([['content', 'sandhi']]),
    };
    handlerModule.cache.clear();
    const res = await handlerModule.slokaResourceHandler(req);
    expect(res.status).toBe(400);
    expect(JSON.parse(res.body).error).toMatch(/Error fetching resource/);
  });
});
