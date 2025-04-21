import { Component, Input, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { UtilityService } from '../services/utility.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs'; // Import 'of' and 'Observable' to provide fallback data
import { ApiService } from '../services/api.service';
import { remoteResource } from '../models/remote-resource.model'; // Import the interface

@Component({
  selector: 'app-sloka',
  templateUrl: './sloka.component.html',
  styleUrls: ['./sloka.component.css'],
  imports: [FormsModule, CommonModule],
  standalone: true
})
export class SlokaComponent implements OnChanges {
  @Input() chapterId: number = 0;
  @Input() showSanskrit: boolean = false;
  @Input() slokaTitle: string = '';
  @Input() slokaGroup: number[] = [];
  @Input() showSandhi: boolean = false;
  @Input() isSlokaGroupsReady: boolean = false
  slokaMeaning: string[] = [];
  sanskritSandhi: string = "";
  sanskritAnvaya: string = "";
  selectedSloka: number | null = null; // Track the selected sloka

  @ViewChild('audioPlayer', { static: false }) audioPlayer!: ElementRef<HTMLAudioElement>;

  constructor(private utilityService: UtilityService,
     private apiService: ApiService) { }

  ngOnInit(): void {
    if (this.slokaGroup.length > 0) {
      this.selectedSloka = this.slokaGroup[0]; // Default to the first sloka in the group
    }
  }

  ngOnChanges(changes: SimpleChanges): void {    
    if (changes['chapterId'] || changes['showSanskrit'] || changes['showSandhi'] ) {
      this.updateSlokaContent();
    }
  }

  getSlokaContent(chapterId: number, slokaId: number, content: string): Observable<string> {
    return this.apiService.getSloka(chapterId, slokaId, content).pipe(
      map((data: any) => data.content),
      catchError((error: any) => {
        console.error(`Error fetching Sloka content for Chapter ${chapterId}, Sloka ${slokaId}, Content: ${content}`, error);
        return of(`Error fetching Sloka content for Chapter ${chapterId}, Sloka ${slokaId}, Content: ${content}`);
      })
    );
  }

  fetchSandhiAndAnvaya(): void {
    if (this.showSanskrit && this.showSandhi && this.isSlokaGroupsReady) {
      this.getSlokaContent(this.chapterId, this.slokaGroup[0], 'sandhi').subscribe(content => {
        this.sanskritSandhi = content;
      });
      this.getSlokaContent(this.chapterId, this.slokaGroup[0], 'anvaya').subscribe(content => {
        this.sanskritAnvaya = content;
      });
    }
  }

  private fetchSlokaMeaningAndAudio(slokaId: number = 0): void {
    this.getSlokaContent(this.chapterId, slokaId, 'meaning').subscribe(content => {
      this.slokaMeaning[slokaId] = content;
    });

    this.apiService.getSlokaAudio(this.chapterId, slokaId).subscribe((response: remoteResource) => {
      this.assignAudioSource(response.url); // Assign the audio source
    }, (error: any) => {
      console.error(`Error fetching audio URL for Sloka ${slokaId}:`, error);
      this.assignAudioSource(''); // Assign the audio source
    });
  }

  updateSlokaContent(): void {
    this.fetchSandhiAndAnvaya();
    this.fetchSlokaMeaningAndAudio(this.slokaGroup[0]);
  }

  onSlokaChange(): void {
    // Dynamically update the audio source
    this.fetchSlokaMeaningAndAudio(this.selectedSloka!); // Fetch meaning and audio for the selected sloka
    this.assignAudioSource();
  }

  private assignAudioSource(audioUrl: string = ''): void {
    if (this.audioPlayer ) {
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
