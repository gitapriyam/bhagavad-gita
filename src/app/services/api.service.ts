/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RemoteResource } from '../models/remote-resource.model'; // Import the interface
import { SlokaData } from '../models/sloka-data.model'; // Import the interface
import { SlokaSearchResult } from '@app/models/sloka-search-result.model';
import { CustomContent } from '@app/models/custom-content.model';
import { ApiBaseUrlService } from './api-base-url.service';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private API_BASE_URL = '';
  constructor(
    private http: HttpClient,
    private apiBaseUrlService: ApiBaseUrlService,
  ) {
    this.API_BASE_URL = this.apiBaseUrlService.getApiBaseUrl();
  }

  // Example: Fetch sloka data
  getSloka(
    chapterId: number,
    slokaIndex: number,
    content: string,
  ): Observable<any> {
    const url = `${this.API_BASE_URL}/sloka/${chapterId}/${slokaIndex}?content=${content}`;
    return this.http.get<any>(url);
  }

  getSlokaContent(
    chapterId: number,
    slokaIndex: string,
    content: string,
  ): Observable<CustomContent> {
    const url = `${this.API_BASE_URL}/sloka/${chapterId}/${slokaIndex}?content=${content}`;
    return this.http.get<CustomContent>(url);
  }

  getSlokaResource(
    chapterId: number,
    slokaIndex: string,
    content: string,
  ): Observable<CustomContent> {
    const url = `${this.API_BASE_URL}/slokaResource/${chapterId}/${slokaIndex}?content=${content}`;
    return this.http.get<CustomContent>(url);
  }

  getSlokaAudio(
    chapterId: number,
    slokaIndex: number,
  ): Observable<RemoteResource> {
    const url = `${this.API_BASE_URL}/slokaAudio/${chapterId}/${slokaIndex}`;
    return this.http.get<RemoteResource>(url);
  }

  getSlokaGroupData(chapterId: number): Observable<any> {
    const url = `${this.API_BASE_URL}/slokaGroups/${chapterId}`;
    return this.http.get<any>(url);
  }

  getChapters(): Observable<any> {
    const url = 'assets/data/chapters.json'; // Path to the JSON file
    return this.http.get<any>(url); // Fetch the JSON file
  }

  getChapterAudio(chapterId: number): Observable<RemoteResource> {
    const url = `${this.API_BASE_URL}/chapterAudio/${chapterId}`;
    return this.http.get<RemoteResource>(url);
  }

  getChapterResource(
    chapterId: number,
    content: string,
  ): Observable<RemoteResource> {
    const API_BASE_URL = this.apiBaseUrlService.getApiBaseUrl();
    const url = `${API_BASE_URL}/chapterResource/${chapterId}?content=${content}`;
    return this.http.get<RemoteResource>(url);
  }

  /**
   * Calls the backend Azure Function to perform a sloka search using Azure Cognitive Search.
   * @param query The search text.
   * @param top The maximum number of results to return (default: 10).
   */
  searchCognitive(
    query: string,
    queryLang: string = 'english',
    top: number = 10,
  ): Observable<SlokaSearchResult[]> {
    // eslint-disable-next-line prettier/prettier
    const params = new HttpParams()
      .set('searchText', query)
      .set('top', top.toString())
      .set('lang', queryLang);
    // Use the API base URL to construct the endpoint

    return this.http.get<SlokaSearchResult[]>(`${this.API_BASE_URL}/slokaSearch`, {
      params,
    });
  }
}
