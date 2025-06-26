/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RemoteResource } from '../models/remote-resource.model'; // Import the interface
import { SlokaData } from '../models/sloka-data.model'; // Import the interface
import { SlokaSearchResult } from '@app/models/sloka-search-result.model';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  // Example: Fetch sloka data
  getSloka(
    chapterId: number,
    slokaIndex: number,
    content: string,
  ): Observable<any> {
    const url = `/api/sloka/${chapterId}/${slokaIndex}?content=${content}`;
    return this.http.get<SlokaData>(url);
  }

  getSlokaAudio(
    chapterId: number,
    slokaIndex: number,
  ): Observable<RemoteResource> {
    const url = `/api/slokaAudio/${chapterId}/${slokaIndex}`;
    return this.http.get<RemoteResource>(url);
  }

  getSlokaGroupData(chapterId: number): Observable<any> {
    const url = `/api/slokaGroups/${chapterId}`;
    return this.http.get<any>(url);
  }

  getChapters(): Observable<any> {
    const url = 'assets/data/chapters.json'; // Path to the JSON file
    return this.http.get<any>(url); // Fetch the JSON file
  }

  getChapterAudio(chapterId: number): Observable<RemoteResource> {
    const url = `/api/chapterAudio/${chapterId}`;
    return this.http.get<RemoteResource>(url);
  }

  getChapterResource(
    chapterId: number,
    content: string,
  ): Observable<RemoteResource> {
    const url = `/api/chapterResource/${chapterId}?content=${content}`;
    return this.http.get<RemoteResource>(url);
  }

  /**
   * Calls the backend Azure Function to perform a sloka search using Azure Cognitive Search.
   * @param query The search text.
   * @param top The maximum number of results to return (default: 10).
   */
  searchCognitive(query: string, queryLang: string ='english', top: number = 10): Observable<SlokaSearchResult[]> {
    // eslint-disable-next-line prettier/prettier
    const params = new HttpParams().set('searchText', query).set('top', top.toString()).set('lang', queryLang);
    return this.http.get<SlokaSearchResult[]>('/api/slokaSearch', { params });
  }
}
