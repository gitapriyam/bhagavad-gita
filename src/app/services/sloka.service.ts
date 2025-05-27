import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SandhiReadiness } from '../models/sandhi-readiness.model';
import { ApiService } from './api.service';
@Injectable({
  providedIn: 'root',
})
export class SlokaService {
  constructor(
    private http: HttpClient,
    private apiService: ApiService,
  ) {}

  getSlokaGroupData(chapterId: number): Observable<any> {
    return this.apiService.getSlokaGroupData(chapterId);
  }

  findSlokaById(
    chapterId: number,
    slokaId: number,
    isSanskrit: boolean,
  ): Observable<number[]> {
    return this.getSlokaGroupData(chapterId).pipe(
      map((data) => {
        if (isSanskrit) {
          const group = data.groups?.find((g: any) =>
            g.slokas.includes(slokaId),
          );
          return group ? group.slokas : [slokaId];
        }
        return [slokaId];
      }),
    );
  }

  isSlokaGroupReady(
    isProduction: boolean,
    readiness: SandhiReadiness,
  ): boolean {
    if (isProduction) {
      return isProduction && readiness.production;
    }
    return readiness.development;
  }
}
