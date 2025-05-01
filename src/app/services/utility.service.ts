import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ChapterService } from './chapter.service';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  constructor(private chapterService: ChapterService) {}

  getChapters(): any[] {
    let chapters: string[] = [];
    this.chapterService.getChapters().subscribe((data: any[]) => {
      chapters = data;
    });
    if (!chapters || chapters.length === 0) {
      console.warn('Chapters data is not yet available.');
    }
    return chapters;
  }

  getChapterName(chapterId: number, isSanskrit: boolean): string {
    const chapters = this.getChapters();
    if (!chapters || !chapters[chapterId]) {
      console.error(
        `Chapter data for chapterId ${chapterId} is not available.`,
      );
      return '';
    }
    return isSanskrit
      ? chapters[chapterId].sanskrit
      : chapters[chapterId].english;
  }

  getSlokaTitle(index: number, isSanskrit: boolean): string {
    return isSanskrit ? 'श्लोकः ' + index : 'Verse ' + index;
  }

  getApplicationTitle(isSanskrit: boolean): string {
    return isSanskrit ? environment.title.sanskrit : environment.title.english;
  }
}
