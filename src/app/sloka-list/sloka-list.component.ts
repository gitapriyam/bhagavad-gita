import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
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
export class SlokaListComponent implements OnChanges {
  @Input() chapterId: number = 0;
  @Input() chapterName: string = '';
  @Input() slokaCount: number = 0;
  @Input() showSanskrit: boolean = false;
  @Output() sanskritToggled = new EventEmitter<boolean>();
  @Output() showSloka = new EventEmitter<number>();
  slokaData: number[][] = [];
  expandedSloka: number | null = null;
  slokas: string[] = [];
  indices: number[] = [];
  showSandhi: boolean = false;
  isPaneVisible: boolean = false;
  groups: any[] = []; // Store groups here
  isSlokaGroupsReady: boolean = false;

  constructor(private utilityService: UtilityService,
    private slokaService: SlokaService,
    private apiService: ApiService) { }

/*   ngOnInit(): void {
    this.loadSlokas();
  } */

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
    const content = this.showSanskrit ? 'sanskrit' : 'english';
    this.slokas = [];
    for (let slokaIndex = 1; slokaIndex <= this.slokaCount; slokaIndex++) {
      this.apiService.getSloka(this.chapterId, slokaIndex, content).subscribe(
        (data: SlokaData) => {
          this.slokas[slokaIndex - 1] = data.content // Adjust this based on the actual response format
        },
        (error) => {
          console.error(`Error fetching sloka ${slokaIndex}:`, error);
        }
      );
    }
  }

  onSlokaClick(index: number): void {
    this.showSloka.emit(index);
  }

  onToggleSanskrit(): void {
    this.showSanskrit = !this.showSanskrit;
    this.sanskritToggled.emit(this.showSanskrit);
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
