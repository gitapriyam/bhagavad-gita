import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment'; // Import environment

@Injectable({
  providedIn: 'root'
})
export class ChapterService {
  constructor() {}

  // Fetch chapters directly from the environment
  getChapters(): Observable<any[]> {
    return of(environment.chapters); // Return chapters as an Observable
  }
}