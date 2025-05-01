import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SlokaComponent } from '../sloka/sloka.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-grouped-sloka',
  standalone: true,
  template: `
    <div class="sloka-group-container">
      <div *ngFor="let slokaId of group">
        <h4>{{ getSlokaTitle(slokaId) }}</h4>
        <div (click)="onToggleGroup(slokaId)" class="custom-pre clickable">
          <ng-container *ngIf="slokas[slokaId]; else loading">
            <pre class="custom-pre clickable">{{ slokas[slokaId] }}</pre>
          </ng-container>
        </div>
        <ng-template #loading>
          <pre class="custom-pre clickable">Loading sloka {{ slokaId }}...</pre>
        </ng-template>
      </div>
      <div *ngIf="expandedSloka === group[0]">
        <app-sloka
          [slokaGroup]="group"
          [chapterId]="chapterId"
          [showSanskrit]="showSanskrit"
          [showSandhi]="showSandhi"
          [isSlokaGroupsReady]="isSlokaGroupsReady"
        ></app-sloka>
      </div>
    </div>
  `,
  imports: [SlokaComponent, CommonModule],
})
export class GroupedSlokaComponent {
  expandedSloka!: number; // Add this property to track the expanded sloka
  @Input() group!: number[];
  @Input() slokas!: { [key: number]: string };
  @Input() chapterId!: number;
  @Input() showSanskrit!: boolean;
  @Input() showSandhi!: boolean;
  @Input() isSlokaGroupsReady!: boolean;
  @Output() toggleGroup = new EventEmitter<number>();

  onToggleGroup(slokaId: number): void {
    this.toggleGroup.emit(slokaId);
  }

  getSlokaTitle(slokaId: number): string {
    return `Sloka ${slokaId}`;
  }
}
