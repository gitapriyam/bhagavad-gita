import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ChaptersComponent } from '@app/chapters/chapters.component';

describe('ChaptersComponent', () => {
  let component: ChaptersComponent;
  let fixture: ComponentFixture<ChaptersComponent>;
  let http: HttpTestingController;
  let page: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [],
    }).compileComponents();

    fixture = TestBed.createComponent(ChaptersComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    page = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function openSandhi(): void {
    component.showSlokas(component.chapters[2]);
    fixture.detectChanges();
    selectReadingMode('sanskrit-sandhi');
  }

  function selectReadingMode(mode: string): void {
    const menu = page.querySelector<HTMLSelectElement>(
      'select[aria-label="Reading language"]',
    )!;
    menu.value = mode;
    menu.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  it('uses one chapter request for the passages and expandable verse groups', () => {
    openSandhi();
    expect(page.querySelector('app-sloka-list')).toBeNull();
    expect(page.querySelector('[role="status"]')?.textContent).toContain(
      'Loading Sanskrit Sandhi',
    );
    http.expectOne('/api/chapter/2?content=sanskrit-sandhi').flush({
      opening: { sloka: 'अथ द्वितीयोऽध्यायः', sandhi: 'अथ द्वितीयः अध्यायः' },
      slokas: [
        {
          number: '2-42-43-44',
          verses: [42, 43, 44],
          sloka: 'यामिमां पुष्पितां वाचं\nप्रवदन्त्यविपश्चितः',
          sandhi: 'याम् इमाम्',
          anvaya: 'अविपश्चितः',
        },
      ],
      closing: { sloka: 'इति', sandhi: 'इति' },
    });
    fixture.detectChanges();

    const reader = page.querySelector('app-sandhi-reader')!;
    const labels = Array.from(reader.querySelectorAll('h3'), (heading) =>
      heading.textContent?.trim(),
    );
    expect(labels).toEqual(['मङ्गलाचरणम्', 'श्लोकाः 42-44', 'पुष्पिका']);
    const [opening, group] = Array.from(
      reader.querySelectorAll<HTMLButtonElement>('button[aria-expanded]'),
    );
    expect(group.textContent).toContain('वाचं\nप्रवदन्त्यविपश्चितः');
    group.click();
    fixture.detectChanges();
    expect(group.getAttribute('aria-expanded')).toBe('true');
    const details = reader.querySelector<HTMLElement>(
      '#' + group.getAttribute('aria-controls'),
    )!;
    expect(details.hidden).toBe(false);
    expect(details.textContent).toContain('सन्धिविग्रह');
    expect(details.textContent).toContain('अन्वय');

    opening.click();
    fixture.detectChanges();
    expect(opening.getAttribute('aria-expanded')).toBe('true');
    expect(group.getAttribute('aria-expanded')).toBe('false');
    expect(details.hidden).toBe(true);
    http.expectNone((request) => request.url.includes('/slokaResource/'));
    http.expectNone('/api/chapter/2?content=sanskrit-sandhi');

    selectReadingMode('sanskrit');
    expect(page.querySelector('app-sandhi-reader')).toBeNull();
    expect(page.querySelector('app-sloka-list')).toBeTruthy();
    expect(component.showSanskrit).toBe(true);

    selectReadingMode('english');
    expect(component.showSanskrit).toBe(false);
  });

  it('cancels the previous chapter request and can retry a failed chapter', () => {
    openSandhi();
    const previous = http.expectOne('/api/chapter/2?content=sanskrit-sandhi');

    component.showSlokas(component.chapters[3]);
    fixture.detectChanges();
    expect(previous.cancelled).toBe(true);
    http.expectOne('/api/chapter/3?content=sanskrit-sandhi').flush(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
    fixture.detectChanges();
    expect(page.querySelector('[role="alert"]')?.textContent).toContain(
      'Unable to load Sanskrit Sandhi',
    );
    page.querySelector<HTMLButtonElement>('app-sandhi-reader button')!.click();
    http
      .expectOne('/api/chapter/3?content=sanskrit-sandhi')
      .flush({ slokas: [] });
    fixture.detectChanges();
    expect(page.querySelector('[role="status"]')?.textContent).toContain(
      'Sanskrit Sandhi is not available',
    );

    component.showSlokas(component.chapters[19]);
    fixture.detectChanges();
    expect(page.querySelector('app-sandhi-reader')).toBeNull();
    expect(
      page.querySelector<HTMLOptionElement>('option[value="sanskrit-sandhi"]')
        ?.disabled,
    ).toBe(true);
    expect(component.readingMode).toBe('sanskrit');
    http.expectNone('/api/chapter/19?content=sanskrit-sandhi');
  });
});
