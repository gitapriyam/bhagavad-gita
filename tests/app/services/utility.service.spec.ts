import { TestBed } from '@angular/core/testing';
import { UtilityService } from '@app/services/utility.service';
import { ChapterService } from '@app/services/chapter.service';
import { of } from 'rxjs';
import { environment } from '@environments/environment';

describe('UtilityService', () => {
  let service: UtilityService;
  let chapterServiceMock: jest.Mocked<ChapterService>;

  beforeEach(() => {
    chapterServiceMock = {
      getChapters: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        UtilityService,
        { provide: ChapterService, useValue: chapterServiceMock },
      ],
    });
    service = TestBed.inject(UtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getChapters', () => {
    it('should return chapters when available', () => {
      const mockChapters = [{ english: 'Chapter 1', sanskrit: 'अध्याय १' }];
      chapterServiceMock.getChapters.mockReturnValue(of(mockChapters));
      const chapters = service.getChapters();
      expect(chapters).toEqual(mockChapters);
    });

    it('should warn if chapters are not available', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      chapterServiceMock.getChapters.mockReturnValue(of([]));
      const chapters = service.getChapters();
      expect(console.warn).toHaveBeenCalledWith(
        'Chapters data is not yet available.',
      );
      expect(chapters).toEqual([]);
    });
  });

  describe('getChapterName', () => {
    it('should return the correct chapter name in English', () => {
      jest
        .spyOn(service, 'getChapters')
        .mockReturnValue([
          null,
          { english: 'Chapter 1', sanskrit: 'अध्याय १' },
        ]);
      expect(service.getChapterName(1, false)).toBe('Chapter 1');
    });

    it('should return the correct chapter name in Sanskrit', () => {
      jest
        .spyOn(service, 'getChapters')
        .mockReturnValue([
          null,
          { english: 'Chapter 1', sanskrit: 'अध्याय १' },
        ]);
      expect(service.getChapterName(1, true)).toBe('अध्याय १');
    });

    it('should return empty string and log error if chapter is missing', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(service, 'getChapters').mockReturnValue([]);
      expect(service.getChapterName(1, false)).toBe('');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getSlokaTitle', () => {
    it('should return Sanskrit sloka title', () => {
      expect(service.getSlokaTitle(5, true)).toBe('श्लोकः 5');
    });

    it('should return English sloka title', () => {
      expect(service.getSlokaTitle(3, false)).toBe('Verse 3');
    });
  });

  describe('getApplicationTitle', () => {
    it('should return Sanskrit application title', () => {
      expect(service.getApplicationTitle(true)).toBe(
        environment.title.sanskrit,
      );
    });

    it('should return English application title', () => {
      expect(service.getApplicationTitle(false)).toBe(
        environment.title.english,
      );
    });
  });
});
