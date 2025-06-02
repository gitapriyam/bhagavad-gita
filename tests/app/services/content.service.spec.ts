import { TestBed } from '@angular/core/testing';
import { ContentService } from '../../../src/app/services/content.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

describe('ContentService', () => {
  let service: ContentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ContentService],
    });
    service = TestBed.inject(ContentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch content as text', () => {
    const testUrl = '/assets/test.txt';
    const mockContent = 'Test content';

    service.getContent(testUrl).subscribe((content) => {
      expect(content).toBe(mockContent);
    });

    const req = httpMock.expectOne(testUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('text');
    req.flush(mockContent);
  });
});
