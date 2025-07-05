import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  OnInit,
  AfterViewInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { UtilityService } from '../services/utility.service';
import { catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs'; // Import 'of' and 'Observable' to provide fallback data
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlokaData } from '@app/models/sloka-data.model';
import { CustomContent } from '@app/models/custom-content.model';

@Component({
  selector: 'app-sloka',
  templateUrl: './sloka.component.html',
  styleUrls: ['./sloka.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
/**
 * SlokaComponent is responsible for displaying and managing the content of a single sloka (verse)
 * or a group of slokas from the Bhagavad Gita. It handles the presentation of Sanskrit text,
 * sandhi (word joining), anvaya (prose order), and audio playback for the selected sloka(s).
 *
 * @remarks
 * - This component reacts to changes in its input properties to update the displayed content and audio.
 * - It fetches sandhi and anvaya content conditionally based on the current view state.
 * - Audio playback is managed via a ViewChild reference to an HTMLAudioElement.
 *
 * @example
 * ```html
 * <app-sloka
 *   [chapterId]="1"
 *   [slokaGroup]="[0, 1, 2]"
 *   [showSanskrit]="true"
 *   [showSandhi]="true"
 *   [isSlokaGroupsReady]="true"
 *   [sloka]="selectedSlokaData"
 *   (slokaChange)="onSlokaChange($event)">
 * </app-sloka>
 * ```
 *
 * @inputs
 * - `chapterId`: The current chapter number.
 * - `showSanskrit`: Whether to display the Sanskrit text.
 * - `slokaTitle`: The title of the sloka or group.
 * - `slokaGroup`: Array of sloka indices to display.
 * - `showSandhi`: Whether to display sandhi breakdown.
 * - `isSlokaGroupsReady`: Indicates if sloka groups are ready for display.
 * - `sloka`: The data object for the current sloka.
 *
 * @outputs
 * - `slokaChange`: Emits the index of the newly selected sloka.
 *
 * @dependencies
 * - UtilityService: For formatting and utility functions.
 * - ApiService: For fetching sloka content and audio URLs.
 *
 * @methods
 * - `fetchSandhiAndAnvaya()`: Fetches sandhi and anvaya content for the current sloka group.
 * - `onSlokaChange()`: Emits the selected sloka index.
 * - `getSlokaTitle(index: number)`: Returns the formatted title for a sloka.
 *
 * @lifecycle
 * - Initializes selected sloka and fetches content on input changes.
 * - Assigns audio source after view initialization and on relevant changes.
 */
export class SlokaComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() chapterId: number = 0;
  @Input() showSanskrit: boolean = false;
  @Input() slokaTitle: string = '';
  @Input() slokaGroup: number[] = [];
  @Input() showSandhi: boolean = false;
  @Input() isSlokaGroupsReady: boolean = false;
  @Input() sloka: SlokaData | null = null;
  @Output() slokaChange = new EventEmitter<number>();
  sanskritSandhi: string = '';
  sanskritAnvaya: string = '';
  selectedSloka: number = this.slokaGroup[0];

  @ViewChild('audioPlayer', { static: false })
  audioPlayer!: ElementRef<HTMLAudioElement>;

  constructor(
    private utilityService: UtilityService,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    if (this.slokaGroup.length > 0) {
      this.selectedSloka = this.slokaGroup[0]; // Default to the first sloka in the group
    }
  }

  ngAfterViewInit(): void {
    // Ensure the audio source is assigned after the view is initialized
    this.assignAudioSource();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['chapterId'] ||
      changes['showSanskrit'] ||
      changes['showSandhi']
    ) {
      this.assignAudioSource();
      this.fetchSandhiAndAnvaya();
    } else if (changes['sloka']) {
      this.assignAudioSource();
    }
  }

  fetchSandhiAndAnvaya(): void {
    if (this.showSanskrit && this.showSandhi && this.isSlokaGroupsReady) {
      this.getSlokaResource(
        this.chapterId,
        this.slokaGroup[0] + 1,
        'sandhi',
      ).subscribe((data) => {
        this.sanskritSandhi = data.content;
      });
      this.getSlokaResource(
        this.chapterId,
        this.slokaGroup[0] + 1,
        'anvaya',
      ).subscribe((data: CustomContent) => {
        this.sanskritAnvaya = data.content;
      });
    }
  }
  /**
   * Returns the range of slokas in the current group as a string.
   * If the group is empty, returns an empty string.
   *
   * @returns {string} The range of slokas in the format "min-max".
   *
   */
  private getSlokaRange(): string {
    if (this.slokaGroup.length === 0) {
      return '';
    }
    if (this.slokaGroup.length === 1) {
      return (this.slokaGroup[0] + 1).toString().padStart(2, '0');
    }

    const min = (Math.min(...this.slokaGroup) + 1).toString().padStart(2, '0');
    const max = (Math.max(...this.slokaGroup) + 1).toString().padStart(2, '0');
    return `${min}-${max}`;
  }

  private getSlokaResource(
    chapterId: number,
    slokaId: number,
    content: string,
  ): Observable<CustomContent> {
    const slokaRange = this.getSlokaRange();
    if (!slokaRange) {
      return of({
        content: `No sloka content available for Chapter ${chapterId}`,
      });
    }
    return this.apiService
      .getSlokaResource(chapterId, slokaRange, content)
      .pipe(
        catchError((error: any) => {
          console.error(
            `Error fetching Sloka content for Chapter ${chapterId}, Sloka ${slokaId}, Content: ${content}`,
            error,
          );
          return of({
            content: `Error fetching Sloka content for Chapter ${chapterId}, Sloka ${slokaId}, Content: ${content}`,
          });
        }),
      );
  }

  onSlokaChange(): void {
    this.slokaChange.emit(this.selectedSloka);
  }

  private assignAudioSource(): void {
    if (this.audioPlayer) {
      const audioElement = this.audioPlayer.nativeElement;
      // Stop the currently playing audio
      audioElement.pause();
      audioElement.currentTime = 0;

      if (this.selectedSloka !== null && this.sloka) {
        audioElement.src = this.sloka.audio_url;
        audioElement.load();
      } else {
        audioElement.src = '';
      }
    }
  }

  getSlokaTitle(index: number): string {
    return this.utilityService.getSlokaTitle(index, this.showSanskrit);
  }
}
