import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { UtilityService } from '../services/utility.service';
import { catchError, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs'; // Import 'of' and 'Observable' to provide fallback data
import { ApiService } from '../services/api.service';
import { RemoteResource } from '../models/remote-resource.model'; // Import the interface
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sloka',
  templateUrl: './sloka.component.html',
  styleUrls: ['./sloka.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SlokaComponent implements OnInit, OnChanges {
  @Input() chapterId: number = 0;
  @Input() showSanskrit: boolean = false;
  @Input() slokaTitle: string = '';
  @Input() slokaGroup: number[] = [];
  @Input() showSandhi: boolean = false;
  @Input() isSlokaGroupsReady: boolean = false;
  slokaMeaning: string = '';
  sanskritSandhi: string = '';
  sanskritAnvaya: string = '';
  selectedSloka: number | null = this.slokaGroup[0];
  private slokaChangeSubject = new Subject<number>();

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
    this.updateSlokaContent();
    // Subscribe to the debounced sloka change events
    this.slokaChangeSubject.pipe(debounceTime(300)).subscribe((slokaId) => {
      this.fetchSlokaMeaningAndAudio(slokaId + 1);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['chapterId'] ||
      changes['showSanskrit'] ||
      changes['showSandhi']
    ) {
      this.selectedSloka = this.slokaGroup[0];
      this.updateSlokaContent();
    }
  }

  updateSlokaContent(): void {
    this.fetchSandhiAndAnvaya();
    if (this.selectedSloka !== null) {
      this.fetchSlokaMeaningAndAudio(this.selectedSloka + 1);
    }
  }

  fetchSandhiAndAnvaya(): void {
    if (this.showSanskrit && this.showSandhi && this.isSlokaGroupsReady) {
      this.getSlokaContent(
        this.chapterId,
        this.slokaGroup[0] + 1,
        'sandhi',
      ).subscribe((content) => {
        this.sanskritSandhi = content;
      });
      this.getSlokaContent(
        this.chapterId,
        this.slokaGroup[0] + 1,
        'anvaya',
      ).subscribe((content) => {
        this.sanskritAnvaya = content;
      });
    }
  }

  private fetchSlokaMeaningAndAudio(slokaId: number): void {
    this.getSlokaContent(this.chapterId, slokaId, 'meaning').subscribe(
      (content) => {
        this.slokaMeaning = content;
      },
    );

    this.apiService.getSlokaAudio(this.chapterId, slokaId).subscribe(
      (response: RemoteResource) => {
        this.assignAudioSource(response.url); // Assign the audio source
      },
      (error: any) => {
        console.error(`Error fetching audio URL for Sloka ${slokaId}:`, error);
        this.assignAudioSource(''); // Assign the audio source
      },
    );
  }

  private getSlokaContent(
    chapterId: number,
    slokaId: number,
    content: string,
  ): Observable<string> {
    return this.apiService.getSloka(chapterId, slokaId, content).pipe(
      map((data: any) => data.content),
      catchError((error: any) => {
        console.error(
          `Error fetching Sloka content for Chapter ${chapterId}, Sloka ${slokaId}, Content: ${content}`,
          error,
        );
        return of(
          `Error fetching Sloka content for Chapter ${chapterId}, Sloka ${slokaId}, Content: ${content}`,
        );
      }),
    );
  }

  onSlokaChange(): void {
    if (this.selectedSloka !== null && !isNaN(Number(this.selectedSloka))) {
      this.slokaChangeSubject.next(Number(this.selectedSloka)); // Ensure it's a number
    } else {
      console.error('Invalid selectedSloka:', this.selectedSloka);
    }
  }

  private assignAudioSource(audioUrl: string = ''): void {
    if (this.audioPlayer) {
      const audioElement = this.audioPlayer.nativeElement;
      // Stop the currently playing audio
      audioElement.pause();
      audioElement.currentTime = 0;

      audioElement.src = audioUrl;
      audioElement.load();
    }
  }

  getSlokaTitle(index: number): string {
    return this.utilityService.getSlokaTitle(index, this.showSanskrit);
  }
}
