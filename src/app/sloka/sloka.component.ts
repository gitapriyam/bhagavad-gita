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
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlokaData } from '@app/models/sloka-data.model';

@Component({
  selector: 'app-sloka',
  templateUrl: './sloka.component.html',
  styleUrls: ['./sloka.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SlokaComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() chapterId: number = 0;
  @Input() showSanskrit: boolean = false;
  @Input() slokaTitle: string = '';
  @Input() slokaGroup: number[] = [];
  @Input() sloka: SlokaData | null = null;
  @Output() slokaChange = new EventEmitter<number>();
  selectedSloka: number = this.slokaGroup[0];

  @ViewChild('audioPlayer', { static: false })
  audioPlayer!: ElementRef<HTMLAudioElement>;

  constructor(private utilityService: UtilityService) {}

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
    if (changes['chapterId'] || changes['showSanskrit'] || changes['sloka']) {
      this.assignAudioSource();
    }
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
