import { TestBed } from '@angular/core/testing';
import { SlokaService } from './sloka.service';
import { ApiService } from './api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { SandhiReadiness } from '../models/sandhi-readiness.model';

describe('SlokaService', () => {
  let service: SlokaService;
  let apiServiceMock: jest.Mocked<ApiService>;

  beforeEach(() => {
    apiServiceMock = {
      getSlokaGroupData: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SlokaService,
        { provide: ApiService, useValue: apiServiceMock },
      ],
    });

    service = TestBed.inject(SlokaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSlokaGroupData', () => {
    it('should call ApiService.getSlokaGroupData', () => {
      apiServiceMock.getSlokaGroupData.mockReturnValue(of({}));
      service.getSlokaGroupData(1).subscribe();
      expect(apiServiceMock.getSlokaGroupData).toHaveBeenCalledWith(1);
    });
  });

  describe('findSlokaById', () => {
    it('should return group slokas if isSanskrit is true and group contains slokaId', (done) => {
      const mockGroups = {
        groups: [{ slokas: [2, 3, 4] }, { slokas: [5, 6] }],
      };
      apiServiceMock.getSlokaGroupData.mockReturnValue(of(mockGroups));
      service.findSlokaById(1, 3, true).subscribe((result) => {
        expect(result).toEqual([2, 3, 4]);
        done();
      });
    });

    it('should return [slokaId] if isSanskrit is false', (done) => {
      apiServiceMock.getSlokaGroupData.mockReturnValue(of({ groups: [] }));
      service.findSlokaById(1, 7, false).subscribe((result) => {
        expect(result).toEqual([7]);
        done();
      });
    });

    it('should return [slokaId] if isSanskrit is true but no group contains slokaId', (done) => {
      const mockGroups = {
        groups: [{ slokas: [2, 3, 4] }],
      };
      apiServiceMock.getSlokaGroupData.mockReturnValue(of(mockGroups));
      service.findSlokaById(1, 10, true).subscribe((result) => {
        expect(result).toEqual([10]);
        done();
      });
    });
  });

  describe('isSlokaGroupReady', () => {
    it('should return readiness.production if isProduction is true', () => {
      const readiness: SandhiReadiness = {
        production: true,
        development: false,
      };
      expect(service.isSlokaGroupReady(true, readiness)).toBe(true);
    });

    it('should return readiness.development if isProduction is false', () => {
      const readiness: SandhiReadiness = {
        production: false,
        development: true,
      };
      expect(service.isSlokaGroupReady(false, readiness)).toBe(true);
    });
  });
});
