import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../services/utility.service';
import { FormsModule } from '@angular/forms';
import { SlokaComponent } from '../sloka/sloka.component';
import { SlokaService } from '../services/sloka.service';
import { environment } from '../../environments/environment';
import { SandhiReadiness } from '../models/sandhi-readiness.model';
import { ApiService } from '../services/api.service';
import { SlokaData } from '../models/sloka-data.model'; // Import the interface
@Component({
  selector: 'app-sloka-list',
  templateUrl: './sloka-list.component.html',
  styleUrls: ['./sloka-list.component.css'],
  imports: [CommonModule, FormsModule, SlokaComponent],
  standalone: true
})
export class SlokaListComponent implements OnChanges, AfterViewInit {
  @Input() chapterId: number = 0;
  @Input() chapterName: string = '';
  @Input() slokaCount: number = 0;
  @Input() showSanskrit: boolean = false;
  @Output() sanskritToggled = new EventEmitter<boolean>();
  @Output() showSloka = new EventEmitter<number>();
  slokaData: number[][] = [];
  expandedSloka: number | null = null;
  slokas: { [key: number]: string } = {}; // Store slokas by index
  indices: number[] = [];
  showSandhi: boolean = false;
  isPaneVisible: boolean = false;
  groups: any[] = []; // Store groups here
  isSlokaGroupsReady: boolean = false;
  contentType: string = 'english'; // Default content type
  observer: IntersectionObserver | null = null;

  @ViewChild('slokaContainer', { static: true }) slokaContainer!: ElementRef;

  constructor(private utilityService: UtilityService,
    private slokaService: SlokaService,
    private apiService: ApiService) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.showSandhi = false;
    if (changes['chapterId'] || changes['showSanskrit'] || changes['chapterName']) {
      this.loadSlokas();
      // Reset showSandhi if isSlokaGroupsReady is false
      if (!this.isSlokaGroupsReady) {
        this.showSandhi = false;
      }
    }
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  togglePane(): void {
    this.isPaneVisible = true;
    setTimeout(() => {
      this.isPaneVisible = false;
    }, 5000); // Hide the pane after 5 seconds
  }

  async populateSlokaData(): Promise<void> {
    const isProduction: boolean = environment.production ? true : false;
    // Prefill with standalone sloka data
    this.slokaData = [];
    this.slokaData = Array.from({ length: this.slokaCount }, (_, i) => [0]);
    // Fetch data once and process it to identify grouped slokas
    if (this.showSanskrit) {
      interface SlokaGroup {
        slokas: number[];
      }

      interface SlokaGroupData {
        groups: SlokaGroup[];
        readiness: SandhiReadiness
      }
      const data: SlokaGroupData = await this.apiService.getSlokaGroupData(this.chapterId).toPromise();
      this.slokaData = Array.from({ length: this.slokaCount }, (_, i) => [i + 1]);
      this.isSlokaGroupsReady = this.slokaService.isSlokaGroupReady(isProduction, data.readiness);
      this.groups = data.groups;
      for (const group of this.groups) {
        for (const slokaId of group.slokas) {
          this.slokaData[slokaId - 1] = group.slokas;
          break; // Exit the inner loop after setting slokaData
        }
      }
    }
    this.slokaData = this.slokaData.map((item, index) => item[0] === 0 ? [index + 1] : item);
    // Compute indices after slokaData is populated
    this.computeIndices();
  }

  loadSlokas(): void {
    this.expandedSloka = null;
    this.populateSlokaData();
    this.chapterName = this.utilityService.getChapterName(this.chapterId, this.showSanskrit);
    this.contentType = this.showSanskrit ? 'sanskrit' : 'english';
    this.slokas = {}; // Reset slokas
    this.indices = Array.from({ length: this.slokaCount }, (_, i) => i + 1); // Create indices for slokas
  }

  setupIntersectionObserver(): void {
    const options = {
      root: null, // Use the viewport as the root
      rootMargin: '0px',
      threshold: 0.1 // Trigger when 10% of the element is visible
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const slokaIndex = Number(entry.target.getAttribute('data-index'));
          if (!this.slokas[slokaIndex]) {
            this.fetchSloka(slokaIndex);
          }
        }
      });
    }, options);

    // Observe all <li> elements
    const placeholders = document.querySelectorAll('.sloka-placeholder');
    placeholders.forEach((placeholder) => this.observer?.observe(placeholder as HTMLElement));
  }

  fetchSloka(slokaIndex: number): void {
    this.apiService.getSloka(this.chapterId, slokaIndex, this.contentType).subscribe(
      (data: SlokaData) => {
        this.slokas[slokaIndex] = data.content; // Store the fetched sloka content
      },
      (error) => {
        console.error(`Error fetching sloka ${slokaIndex}:`, error);
      }
    );
  }

  onSlokaClick(index: number): void {
    this.showSloka.emit(index);
  }

  onToggleSanskrit(): void {
    this.showSanskrit = !this.showSanskrit;
    this.sanskritToggled.emit(this.showSanskrit);
    this.loadSlokas(); // Reload slokas when toggling Sanskrit
  }

  onToggleSandhi(): void {
    this.showSandhi = !this.showSandhi;
  }

  getSlokaTitle(index: number): string {
    return this.utilityService.getSlokaTitle(index, this.showSanskrit);
  }

  toggleSloka(slokaIndex: number): void {
    this.expandedSloka = this.expandedSloka === slokaIndex ? null : slokaIndex;
  }

  toggleSlokaGroup(index: number): void {
    this.expandedSloka = this.expandedSloka === this.slokaData[index][0] ? null : this.slokaData[index][0];
  }

  computeIndices(): void {
    this.indices = [];
    if (!this.showSanskrit) {
      for (let i = 0; i < this.slokaData.length; i++) {
        this.indices.push(i);
      }
    } else {
      let i = 0;
      while (i < this.slokaData.length) {
        this.indices.push(i);
        i += this.slokaData[i].length;
      }
    }
  }
}
