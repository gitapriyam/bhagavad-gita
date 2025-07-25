/* global jest, describe, it, expect, afterEach */
const axios = require('axios');
jest.mock('axios');
const { handler } = require('../functions/searchCognitive');

describe('searchCognitive Azure Function', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns 400 for empty search query', async () => {
    const request = { query: new Map([['searchText', '']]) };
    const result = await handler(request);
    expect(result.status).toBe(400);
    expect(result.body).toMatch(/Missing search query/);
  });

  it('returns 200 and results for successful search', async () => {
    const mockResponse = {
      data: {
        value: [
          {
            content:
              '{"chapter": 2, "sloka_number": 4, "text": "Arjuna Uvaacha"}',
            metadata_storage_path:
              'https://slokastorage.blob.core.windows.net/gita-app-resources/english/chapter-02/sloka_04.json',
          },
        ],
      },
    };
    axios.post.mockResolvedValue(mockResponse);

    const request = {
      query: new Map([
        ['searchText', 'yoga'],
        ['top', '1'],
      ]),
    };
    const result = await handler(request);

    expect(result.status).toBe(200);
    const responseBody = JSON.parse(result.body); // Parse the JSON string
    expect(responseBody).toContainEqual({
      chapter: 2,
      slokaNumber: 4,
      sloka: 'Arjuna Uvaacha',
    });
    expect(result.headers['Content-Type']).toBe('application/json');
  });

  it('returns 500 on Azure Cognitive Search error', async () => {
    axios.post.mockRejectedValue(new Error('Azure error'));
    const request = { query: new Map([['searchText', 'yoga']]) };
    const result = await handler(request);
    expect(result.status).toBe(500);
    expect(result.body).toMatch(/Azure Cognitive Search query failed/);
  });
});
