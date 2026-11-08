export interface SandhiPassage {
  sloka: string;
  sandhi?: string;
  anvaya?: string;
}

export interface SandhiVerse extends SandhiPassage {
  number: string;
  verses: number[];
}

export interface SandhiChapter {
  opening?: SandhiPassage | null;
  closing?: SandhiPassage | null;
  slokas: SandhiVerse[];
}
