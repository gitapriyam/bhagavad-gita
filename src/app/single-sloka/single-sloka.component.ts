import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UtilityService } from '../services/utility.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlokaComponent } from '../sloka/sloka.component';

@Component({
  selector: 'app-single-sloka',
  template: `<div class="sloka-single-container">
    <h4>{{ getSlokaTitle(index) }}</h4>
    <div (click)="onToggle()" class="custom-pre clickable">
      <ng-container *ngIf="sloka !== undefined && sloka !== null; else loading">
        <pre class="custom-pre clickable">{{ sloka }}</pre>
      </ng-container>
    </div>
    <ng-template #loading>
      <pre class="custom-pre clickable">Loading sloka {{ index + 1 }}...</pre>
    </ng-template>
    <div *ngIf="expandedSloka === index">
      <app-sloka
        [chapterId]="chapterId"
        [slokaGroup]="[index]"
        [showSanskrit]="showSanskrit"
        [showSandhi]="showSandhi"
        [isSlokaGroupsReady]="isSlokaGroupsReady"
      ></app-sloka>
    </div>
  </div>`,
  standalone: true,
  imports: [CommonModule, FormsModule, SlokaComponent],
})
export class SingleSlokaComponent {
  @Input() index!: number;
  @Input() sloka!: string | null;
  @Input() expandedSloka!: number;
  @Input() chapterId!: number;
  @Input() showSanskrit: boolean = false;
  @Input() showSandhi: boolean = false;
  @Input() isSlokaGroupsReady: boolean = false;
  @Output() slokaToggle = new EventEmitter<number>();

  constructor(private utilityService: UtilityService) {}

  onToggle(): void {
    this.slokaToggle.emit(this.index);
  }

  getSlokaTitle(index: number): string {
    return this.utilityService.getSlokaTitle(index + 1, this.showSanskrit);
  }
}
