import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { SlokaComponent } from '../sloka/sloka.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlokaData } from '@app/models/sloka-data.model';
@Component({
  selector: 'app-grouped-sloka',
  template: `
    <div class="sloka-group-container">
      <div *ngFor="let slokaId of group">
        <h4>{{ getSlokaTitle(slokaId) }}</h4>
        <div (click)="onToggleGroup(slokaId)" class="custom-pre clickable">
          <ng-container *ngIf="slokas[slokaId]; else loading">
            <pre class="custom-pre clickable">{{ slokas[slokaId].text }}</pre>
          </ng-container>
        </div>
        <ng-template #loading>
          <pre class="custom-pre clickable">Loading sloka {{ slokaId }}...</pre>
        </ng-template>
      </div>
      <div *ngIf="expandedSloka === group[0]">
        <app-sloka
          [chapterId]="chapterId"
          [slokaGroup]="group"
          [showSanskrit]="showSanskrit"
          [showSandhi]="showSandhi"
          [isSlokaGroupsReady]="isSlokaGroupsReady"
          [sloka]="selectedSloka !== null ? slokas[selectedSloka] : null"
          (slokaChange)="onSlokaSelected($event)"
        ></app-sloka>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, FormsModule, SlokaComponent],
})
export class GroupedSlokaComponent implements OnInit {
  @Input() expandedSloka!: number; // Add this property to track the expanded sloka
  @Input() group!: number[];
  @Input() slokas!: { [key: number]: SlokaData };
  @Input() chapterId!: number;
  @Input() showSanskrit!: boolean;
  @Input() showSandhi!: boolean;
  @Input() isSlokaGroupsReady!: boolean;
  @Output() toggleGroup = new EventEmitter<number>();
  selectedSloka: number | null = null;
  onToggleGroup(slokaId: number): void {
    this.toggleGroup.emit(slokaId);
  }

  ngOnInit(): void {
    // Set the selected sloka to the first one in the group by default
    this.selectedSloka = this.group[0];
  }
  getSlokaTitle(slokaId: number): string {
    return `Sloka ${slokaId + 1}`;
  }

  onSlokaSelected(slokaId: number) {
    this.selectedSloka = slokaId;
  }
}
