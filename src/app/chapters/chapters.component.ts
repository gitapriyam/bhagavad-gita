import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  HostListener,
} from '@angular/core';
import { environment } from '../../environments/environment';
import { SlokaListComponent } from '../sloka-list/sloka-list.component';
import { UtilityService } from '../services/utility.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SlokaComponent } from '../sloka/sloka.component';
import { ChapterService } from '../services/chapter.service';
import { ApiService } from '../services/api.service';
import { RemoteResource } from '../models/remote-resource.model';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { LoggerService } from '@app/services/logging.service';
import { SearchResultsComponent } from '../search-results/search-results.component';
@Component({
  selector: 'app-chapters',
  templateUrl: './chapters.component.html',
  styleUrls: ['./chapters.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    SlokaListComponent,
    SlokaComponent,
    SearchResultsComponent,
  ],
  standalone: true,
})
export class ChaptersComponent implements OnInit {
  chapterId: number = 0;
  chapters: any[] = [];
  chapterName: string = '';
  showChapterView: boolean = true;
  showSlokaView: boolean = false;
  slokaTitle: string = '';
  slokaCount: number = 0;
  windowWidth: number = 0;
  slokaId: number = 0;
  showSanskrit: boolean = false;
  fontSize: number = 16;
  chapterAudioSrc: string = '';
  chapterResource: string = '';
  chapterTamilResource: string = '';
  showReferences: boolean = false;
  references: string[] = environment.references;
  isDropdownOpen: boolean = false;
  showSearchModal = false;
  showHelpAndReferences = false;

  constructor(
    private utilityService: UtilityService,
    private chapterService: ChapterService,
    private apiService: ApiService,
    private cookieService: CookieService,
    private logger: LoggerService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.loadChapters();
    if (this.cookieService.get('currentChapter')) {
      this.chapterId = +this.cookieService.get('currentChapter');
    }
    if (this.cookieService.get('showSanskrit')) {
      this.showSanskrit = this.cookieService.get('showSanskrit') === 'true';
    }
    if (isPlatformBrowser(this.platformId)) {
      this.windowWidth = window.innerWidth;
      this.showSlokas(this.chapters[this.chapterId]);
      this.adjustChapterView(this.windowWidth);
    }
    this.showReferences = false;
  }

  private loadChapters(): void {
    this.chapterService.getChapters().subscribe(
      (response: any) => {
        this.chapters = response.chapters || response; // Handle both cases: response.chapters or response directly
      },
      (error: any) => {
        console.error('Error fetching chapters:', error);
      },
    );
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (isPlatformBrowser(this.platformId)) {
      this.windowWidth = event.target.innerWidth;
      this.adjustChapterView(this.windowWidth);
    }
  }

  private adjustChapterView(width: number): void {
    this.showChapterView = width >= 768; // Show chapter view on desktop/tablets, hide on mobile
  }

  toggleMenu(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.windowWidth < 768) {
        this.showChapterView = !this.showChapterView;
      }
    }
  }

  showSlokas(chapter: any): void {
    this.chapterId = chapter.id;
    this.chapterName = this.showSanskrit ? chapter.sanskrit : chapter.english;
    this.slokaCount = chapter.slokaCount;
    this.showSlokaView = false;

    this.assignChapterResource();
    this.assignChapterResource(true);
    this.assignChapterAudio();

    if (isPlatformBrowser(this.platformId) && this.windowWidth < 768) {
      this.showChapterView = false;
    }
  }

  private assignChapterAudio() {
    this.apiService.getChapterAudio(this.chapterId).subscribe(
      (response: RemoteResource) => {
        this.chapterAudioSrc = response.url; // Assign the audio source
      },
      (error: any) => {
        console.error(
          `Error fetching audio URL for Chapter ${this.chapterId}:`,
          error,
        );
        this.chapterAudioSrc = '';
      },
    );
  }

  private assignChapterResource(isTamil: boolean = false): void {
    let content = this.showSanskrit ? 'sanskrit' : 'english';
    if (isTamil) {
      content = 'tamil';
    }
    this.apiService.getChapterResource(this.chapterId, content).subscribe(
      (response: RemoteResource) => {
        const chapterResource = response.url;
        if (isTamil) {
          this.chapterTamilResource = chapterResource;
        } else {
          this.chapterResource = chapterResource;
        }
      },
      (error: any) => {
        console.error(
          `Error fetching chapter URL for Chapter ${this.chapterId}:`,
          error,
        );
        this.chapterResource = '';
      },
    );
  }

  showSloka(slokaIndex: number): void {
    this.slokaId = slokaIndex;
    this.showSlokaView = true;
  }

  backToSlokaList(): void {
    this.showSlokaView = false;
  }

  toggleSanskrit(): void {
    this.showSanskrit = !this.showSanskrit;
    this.assignChapterResource();
  }

  getChapterName(chapter: any): string {
    return this.utilityService.getChapterName(chapter.id, this.showSanskrit);
  }

  hideChapterOverlay(): void {
    if (this.windowWidth < 768) {
      this.showChapterView = false;
    }
  }

  increaseFontSize(): void {
    this.fontSize += 2;
  }

  decreaseFontSize(): void {
    this.fontSize -= 2;
  }

  getApplicationTitle(): string {
    return this.utilityService.getApplicationTitle(this.showSanskrit);
  }

  openReferences(): void {
    this.showReferences = true;
  }

  closeReferences(): void {
    this.showReferences = false;
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    // Close the dropdown if the click is outside the dropdown
    if (!target.closest('.dropdown')) {
      this.isDropdownOpen = false;
    }
  }

  openSearchModal() {
    this.showSearchModal = true;
  }

  closeSearchModal() {
    this.showSearchModal = false;
  }

  openHelpAndReferences() {
    this.showHelpAndReferences = true;
  }

  closeHelpAndReferences() {
    this.showHelpAndReferences = false;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent) {
    if (this.showSearchModal) {
      this.closeSearchModal();
    }
  }
}
