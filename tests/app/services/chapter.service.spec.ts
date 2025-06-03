import { TestBed } from '@angular/core/testing';
import { ChapterService } from '@app/services/chapter.service';
import { environment } from '@environments/environment';

describe('ChapterService', () => {
  let service: ChapterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChapterService],
    });
    service = TestBed.inject(ChapterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return chapters from environment', (done) => {
    service.getChapters().subscribe((chapters) => {
      expect(chapters).toEqual(environment.chapters);
      done();
    });
  });
});
