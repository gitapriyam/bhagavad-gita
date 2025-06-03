import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ApiService } from '@app/services/api.service';
import { RemoteResource } from '@app/models/remote-resource.model';
import { SlokaData } from '@app/models/sloka-data.model';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch sloka data', () => {
    const dummyData: SlokaData = { content: 'sloka' } as SlokaData;
    service.getSloka(1, 2, 'test').subscribe((data) => {
      expect(data).toEqual(dummyData);
    });
    const req = httpMock.expectOne('/api/sloka/1/2?content=test');
    expect(req.request.method).toBe('GET');
    req.flush(dummyData);
  });

  it('should fetch sloka audio', () => {
    const dummyAudio: RemoteResource = { url: 'audio.mp3' } as RemoteResource;
    service.getSlokaAudio(1, 2).subscribe((data) => {
      expect(data).toEqual(dummyAudio);
    });
    const req = httpMock.expectOne('/api/slokaAudio/1/2');
    expect(req.request.method).toBe('GET');
    req.flush(dummyAudio);
  });

  it('should fetch sloka group data', () => {
    const dummyGroup = { group: [1, 2, 3] };
    service.getSlokaGroupData(1).subscribe((data) => {
      expect(data).toEqual(dummyGroup);
    });
    const req = httpMock.expectOne('/api/slokaGroups/1');
    expect(req.request.method).toBe('GET');
    req.flush(dummyGroup);
  });

  it('should fetch chapters', () => {
    const dummyChapters = [{ id: 1, name: 'Chapter 1' }];
    service.getChapters().subscribe((data) => {
      expect(data).toEqual(dummyChapters);
    });
    const req = httpMock.expectOne('assets/data/chapters.json');
    expect(req.request.method).toBe('GET');
    req.flush(dummyChapters);
  });

  it('should fetch chapter audio', () => {
    const dummyAudio: RemoteResource = {
      url: 'chapter-audio.mp3',
    } as RemoteResource;
    service.getChapterAudio(1).subscribe((data) => {
      expect(data).toEqual(dummyAudio);
    });
    const req = httpMock.expectOne('/api/chapterAudio/1');
    expect(req.request.method).toBe('GET');
    req.flush(dummyAudio);
  });

  it('should fetch chapter resource', () => {
    const dummyResource: RemoteResource = {
      url: 'resource.pdf',
    } as RemoteResource;
    service.getChapterResource(1, 'summary').subscribe((data) => {
      expect(data).toEqual(dummyResource);
    });
    const req = httpMock.expectOne('/api/chapterResource/1?content=summary');
    expect(req.request.method).toBe('GET');
    req.flush(dummyResource);
  });
});
