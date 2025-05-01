import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlokaComponent } from '../sloka/sloka.component';
import { UtilityService } from '../services/utility.service';
@Component({
  selector: 'app-single-sloka',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  template: `<div class="sloka-single-container">
    <h4>{{ getSlokaTitle(index) }}</h4>
    <div (click)="onToggle()" class="custom-pre clickable">
      <ng-container *ngIf="sloka; else loading">
        <pre class="custom-pre clickable">{{ sloka }}</pre>
      </ng-container>
    </div>
    <ng-template #loading>
      <pre class="custom-pre clickable">Loading sloka {{ index + 1 }}...</pre>
    </ng-template>
    <div *ngIf="expandedSloka === index">
      <app-sloka
        [chapterId]="chapterId"
        [slokaGroup]="[index + 1]"
        [showSanskrit]="showSanskrit"
        [showSandhi]="showSandhi"
        [isSlokaGroupsReady]="isSlokaGroupsReady"
      ></app-sloka>
    </div>
  </div> `,
  imports: [SlokaComponent, CommonModule],
})
export class SingleSlokaComponent {
  @Input() index!: number;
  @Input() sloka!: string;
  @Input() expandedSloka!: number; // Added property
  @Input() chapterId!: number;
  @Input() showSanskrit!: boolean;
  @Input() showSandhi!: boolean;
  @Input() isSlokaGroupsReady!: boolean;
  @Output() slokaToggle = new EventEmitter<number>(); // Renamed from 'toggle'

  constructor(private utilityService: UtilityService) {}

  onToggle(): void {
    this.slokaToggle.emit(this.index);
  }

  getSlokaTitle(index: number): string {
    return this.utilityService.getSlokaTitle(index + 1, this.showSanskrit);
  }
}
