import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SandhiPassage, SandhiVerse } from '../models/sandhi-chapter.model';
import { ApiService } from '../services/api.service';

interface SandhiRow extends SandhiPassage {
  label: string;
}

@Component({
  selector: 'app-sandhi-reader',
  standalone: true,
  templateUrl: './sandhi-reader.component.html',
  styleUrls: ['./sandhi-reader.component.css'],
})
export class SandhiReaderComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) chapterId!: number;
  rows: SandhiRow[] = [];
  expandedRow: number | null = null;
  loading = false;
  loadFailed = false;
  private request?: Subscription;

  constructor(private apiService: ApiService) {}

  ngOnChanges(): void {
    this.loadChapter();
  }

  ngOnDestroy(): void {
    this.request?.unsubscribe();
  }

  loadChapter(): void {
    this.request?.unsubscribe();
    this.rows = [];
    this.expandedRow = null;
    this.loadFailed = false;
    this.loading = true;

    this.request = this.apiService.getSandhiChapter(this.chapterId).subscribe({
      next: ({ opening, slokas, closing }) => {
        this.rows = [
          ...(opening?.sloka?.trim()
            ? [{ ...opening, label: 'मङ्गलाचरणम्' }]
            : []),
          ...slokas.map((verse) => ({
            ...verse,
            label: this.verseLabel(verse),
          })),
          ...(closing?.sloka?.trim()
            ? [{ ...closing, label: 'पुष्पिका' }]
            : []),
        ];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadFailed = true;
      },
    });
  }

  toggleRow(index: number): void {
    this.expandedRow = this.expandedRow === index ? null : index;
  }

  private verseLabel({ verses, number }: SandhiVerse): string {
    if (verses.length < 2) {
      return `श्लोक ${verses[0] ?? number}`;
    }
    const first = verses[0];
    const last = verses[verses.length - 1];
    const range = verses.every((verse, index) => verse === first + index)
      ? `${first}-${last}`
      : verses.join(', ');
    return `श्लोकाः ${range}`;
  }
}
