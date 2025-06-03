import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { UtilityService } from '../services/utility.service';
import { SlokaService } from '../services/sloka.service';
import { environment } from '../../environments/environment';
import { SandhiReadiness } from '../models/sandhi-readiness.model';
import { ApiService } from '../services/api.service';
import { SlokaData } from '../models/sloka-data.model';
import { SingleSlokaComponent } from '../single-sloka/single-sloka.component';
import { GroupedSlokaComponent } from '../grouped-sloka/grouped-sloka.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sloka-list',
  templateUrl: './sloka-list.component.html',
  styleUrls: ['./sloka-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SingleSlokaComponent,
    GroupedSlokaComponent,
  ],
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
  observer: IntersectionObserver | null = null;
  isViewportLoading = true;
  viewportIndices: number[] = []; // Add this property to track indices in the viewport
  visibleSlokaIndices = new Set<number>();

  @ViewChild('slokaContainer', { static: true }) slokaContainer!: ElementRef;

  constructor(
    private apiService: ApiService,
    private utilityService: UtilityService,
    private slokaService: SlokaService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.showSandhi = false;
    if (changes['chapterId'] || changes['showSanskrit']) {
      this.loadSlokas();
      setTimeout(() => {
        this.setupIntersectionObserver(); // Reinitialize the observer after DOM update
      });
    }
    if (!this.isSlokaGroupsReady) {
      this.showSandhi = false;
    }
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
    this.setupMutationObserver();
  }

  togglePane(): void {
    this.isPaneVisible = true;
    setTimeout(() => {
      this.isPaneVisible = false;
    }, 3000); // Hide the pane after 3 seconds
  }

  optimizeSlokaData(): void {
    if (this.isSlokaGroupsReady === false) {
      return; // No need to optimize if not showing Sanskrit
    }
    const groupElements = new Set<number>(); // Track all elements that are part of groups

    // Identify all elements that belong to groups
    this.slokaData.forEach((group) => {
      if (group.length > 1) {
        group.forEach((slokaId) => groupElements.add(slokaId));
      }
    });

    // Filter out single-element arrays that overlap with groups
    this.slokaData = this.slokaData.filter((group) => {
      if (group.length === 1) {
        return !groupElements.has(group[0]); // Keep only if not part of any group
      }
      return true; // Keep groups as they are
    });
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
        readiness: SandhiReadiness;
      }
      const data: SlokaGroupData = await this.apiService
        .getSlokaGroupData(this.chapterId)
        .toPromise();
      this.isSlokaGroupsReady = this.slokaService.isSlokaGroupReady(
        isProduction,
        data.readiness,
      );
      this.groups = data.groups;
      for (const group of this.groups) {
        for (const slokaId of group.slokas) {
          this.slokaData[slokaId] = group.slokas;
          break; // Exit the inner loop after setting slokaData
        }
      }
    }

    this.slokaData = this.slokaData.map((item, index) =>
      item[0] === 0 ? [index] : item,
    );
    // Optimize slokaData to remove overlaps
    this.optimizeSlokaData();
    // Compute indices after slokaData is populated
    this.computeIndices();
  }

  loadSlokas(): void {
    this.slokas = {}; // Reset slokas
    this.expandedSloka = null;
    this.populateSlokaData();
    this.chapterName = this.utilityService.getChapterName(
      this.chapterId,
      this.showSanskrit,
    );
  }

  setupIntersectionObserver(): void {
    if (this.observer) {
      this.observer.disconnect(); // Disconnect existing observers
    }

    const options = {
      root: null, // Use the viewport as the root
      rootMargin: '200px', // Add margin to trigger earlier
      threshold: 0.01, // Trigger when 1% of the element is visible
    };

    this.observer = new IntersectionObserver((entries) => {
      let changed = false;
      entries.forEach((entry) => {
        const dataIndex = entry.target.getAttribute('data-index');
        if (!dataIndex) return;
        const index = Number(dataIndex);

        if (entry.isIntersecting) {
          if (!this.visibleSlokaIndices.has(index)) {
            this.visibleSlokaIndices.add(index);
            changed = true;
          }
          const slokaGroup = this.slokaData[index];
          if (Array.isArray(slokaGroup) && slokaGroup.length > 1) {
            slokaGroup.forEach((slokaId) => {
              if (
                this.slokas[slokaId] === undefined ||
                this.slokas[slokaId] === null
              ) {
                this.fetchSloka(slokaId);
              }
            });
          } else {
            const slokaIndex = slokaGroup[0];
            if (
              this.slokas[slokaIndex] === undefined ||
              this.slokas[slokaIndex] === null
            ) {
              this.fetchSloka(slokaIndex);
            }
          }
        } else {
          if (this.visibleSlokaIndices.delete(index)) {
            changed = true;
          }
        }
      });
      if (changed) {
        // Update viewportIndices to reflect the current set of visible sloka indices.
        // This ensures that the application can check whether the slokas currently in the viewport are loaded.
        this.viewportIndices = Array.from(this.visibleSlokaIndices);
        this.checkViewportSlokasLoaded();
      }
    }, options);

    const placeholders = document.querySelectorAll('.sloka-placeholder');
    placeholders.forEach((placeholder) =>
      this.observer?.observe(placeholder as HTMLElement),
    );
  }

  setupMutationObserver(): void {
    const observer = new MutationObserver(() => {
      this.setupIntersectionObserver(); // Reinitialize IntersectionObserver on DOM changes
    });

    observer.observe(this.slokaContainer.nativeElement, {
      childList: true, // Observe changes to child elements
      subtree: true, // Observe changes in all descendants
    });
  }

  getContentType(): string {
    return this.showSanskrit ? 'sanskrit' : 'english';
  }

  fetchSloka(slokaIndex: number): void {
    this.apiService
      .getSloka(this.chapterId, slokaIndex + 1, this.getContentType())
      .subscribe(
        (data: SlokaData) => {
          this.slokas[slokaIndex] = data.content;
          this.checkViewportSlokasLoaded();
        },
        (error) => {
          const errorMsg = `Error fetching sloka ${slokaIndex}: ${error}`;
          this.slokas[slokaIndex] = errorMsg;
          console.error(errorMsg);
        },
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
    const group = this.slokaData[slokaIndex];
    if (!group) {
      console.error(`No group found for sloka index ${slokaIndex}`);
      return;
    }

    // Expand or collapse the group
    this.expandedSloka = this.expandedSloka === group[0] ? null : group[0];
  }

  toggleSlokaGroup(slokaIndex: number): void {
    const index: number = this.slokaData.findIndex((group) => {
      if (group.length > 1) {
        return group.includes(slokaIndex);
      } else {
        return group[0] === slokaIndex;
      }
    });

    if (index === -1) {
      console.error(`No group found for sloka index ${slokaIndex}`);
      return;
    }

    this.expandedSloka =
      this.expandedSloka === this.slokaData[index][0]
        ? null
        : this.slokaData[index][0];
  }

  computeIndices(): void {
    this.indices = Array.from({ length: this.slokaData.length }, (_, i) => i);
  }

  checkViewportSlokasLoaded(): void {
    // Suppose you have a list of indices for slokas in the viewport: this.viewportIndices
    this.isViewportLoading = !this.viewportIndices.every(
      (i) => this.slokas[i] !== undefined && this.slokas[i] !== null,
    );
  }

  onViewportChange(indices: number[]): void {
    this.viewportIndices = indices;
    this.checkViewportSlokasLoaded();
  }
}
