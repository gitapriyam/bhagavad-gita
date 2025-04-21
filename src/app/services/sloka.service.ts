import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SandhiReadiness } from '../models/sandhi-readiness.model';
import { ApiService } from './api.service'; 
@Injectable({
  providedIn: 'root'
})
export class SlokaService {

  constructor(private http: HttpClient, private apiService: ApiService) { }

  getSlokaGroupData(chapterId: number): Observable<any> {    
    return this.apiService.getSlokaGroupData(chapterId);
  }

  findSlokaById(chapterId: number, slokaId: number, isSanskrit: boolean): Observable<number[]> {
    return this.getSlokaGroupData(chapterId).pipe(
      map(data => {
        if (isSanskrit) {
          // Check sloka groups
          for (const group of data.groups) {
            if (group.slokas.includes(slokaId)) {
              return group.slokas;
            }
          }
        }

        // Treat other slokas as standalone
        return [slokaId];
      })
    );
  }

  isSlokaGroupReady(isProduction: boolean, readiness: SandhiReadiness ): boolean {
    if (isProduction) {
      return isProduction && readiness.production;
    }
    return !isProduction && readiness.development;
  }
}

