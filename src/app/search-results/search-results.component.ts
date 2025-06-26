import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlokaSearchResult } from '@app/models/sloka-search-result.model';
import { UtilityService } from '@app/services/utility.service';
@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true,
})
export class SearchResultsComponent {
  results: SlokaSearchResult[] = [];
  searchTerm = '';
  searchLang = 'english'; // Default language for search
  topRecords = 10;
  loading = false;
  searched = false;

  constructor(
    private api: ApiService,
    private utilityService: UtilityService,
  ) {}

  onSearch() {
    if (this.searchTerm.trim()) {
      this.loading = true;
      this.searched = true;
      const lowerCaseTerm = this.searchTerm.toLowerCase();
      this.api
        .searchCognitive(lowerCaseTerm, this.searchLang, this.topRecords)
        .subscribe(
          (res) => {
            this.results = res;
            this.loading = false;
          },
          () => {
            this.results = [];
            this.loading = false;
          },
        );
    }
  }
  onClearSearch() {
    this.searchTerm = '';
    this.results = [];
    this.searched = false;
  }

  getSlokaTitle(chapter: number, index: number): string {
    const chapterTitle = this.utilityService.getChapterName(chapter, false);
    return `${chapterTitle}, Sloka ${index}`;
  }
}
