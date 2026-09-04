/* global jest, describe, it, expect, beforeEach */
const axios = require('axios');
const utils = require('../functions/utils.js');
const handlerModule = require('../functions/chapter.js');
const { chapterHandler: handler } = handlerModule;

jest.mock('axios');
jest.mock('../functions/utils.js', () => ({
  getSanskritSandhiUrl: jest.fn(),
  validateChapterId: jest.fn(),
}));

require('../functions/chapter.js');

describe('chapter Azure Function', () => {
  let context;

  beforeEach(() => {
    jest.clearAllMocks();
    handlerModule.cache.clear();
    context = { log: jest.fn() };
  });

  it('should return 400 for invalid chapter', async () => {
    utils.validateChapterId.mockImplementation(() => {
      throw new Error('Invalid chapter');
    });

    const request = {
      params: { chapterId: 'abc' },
      query: new Map([['content', 'sanskrit-sandhi']]),
    };
    const result = await handler(request, context);

    expect(result.status).toBe(400);
    expect(JSON.parse(result.body).error).toBe('Invalid chapter');
  });

  it('should return 400 for unsupported content', async () => {
    utils.validateChapterId.mockImplementation(() => {});

    const request = {
      params: { chapterId: '1' },
      query: new Map([['content', 'english']]),
    };
    const result = await handler(request, context);

    expect(result.status).toBe(400);
    expect(JSON.parse(result.body).error).toMatch(/Allowed content values/);
  });

  it('should return Sanskrit sandhi chapter content', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.getSanskritSandhiUrl.mockReturnValue(
      'https://resource.url/chapter-1/sandhi.json',
    );
    axios.get.mockResolvedValue({
      data: {
        chapter: 1,
        title: 'साङ्ख्ययोगः',
        opening: {
          sloka: 'अथ द्वितीयोऽध्यायः । साङ्ख्ययोगः ।',
          sandhi: 'अथ द्वितीयः अध्यायः । साङ्ख्य-योगः ।',
        },
        slokas: [
          {
            number: '2-1',
            sandhi: 'श्रीभगवान् उवाच ।',
          },
        ],
      },
    });

    const request = {
      params: { chapterId: '1' },
      query: new Map([['content', 'sanskrit-sandhi']]),
    };
    const result = await handler(request, context);

    expect(result.status).toBe(200);
    expect(JSON.parse(result.body)).toEqual({
      chapter: 1,
      title: 'साङ्ख्ययोगः',
      opening: {
        sloka: 'अथ द्वितीयोऽध्यायः । साङ्ख्ययोगः ।',
        sandhi: 'अथ द्वितीयः अध्यायः । साङ्ख्य-योगः ।',
      },
      slokas: [
        {
          number: '2-1',
          sandhi: 'श्रीभगवान् उवाच ।',
        },
      ],
    });
    expect(axios.get).toHaveBeenCalledWith(
      'https://resource.url/chapter-1/sandhi.json',
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  });

  it('should return cached response if available', async () => {
    utils.validateChapterId.mockImplementation(() => {});
    utils.getSanskritSandhiUrl.mockReturnValue(
      'https://resource.url/chapter-1/sandhi.json',
    );
    axios.get.mockResolvedValue({
      data: {
        chapter: 1,
        slokas: [],
      },
    });

    const request = {
      params: { chapterId: '1' },
      query: new Map([['content', 'sanskrit-sandhi']]),
    };
    await handler(request, context);
    const result = await handler(request, context);

    expect(result.status).toBe(200);
    expect(JSON.parse(result.body).chapter).toBe(1);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
});
