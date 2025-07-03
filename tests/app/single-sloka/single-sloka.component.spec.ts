import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SingleSlokaComponent } from '@app/single-sloka/single-sloka.component';
import { SlokaComponent } from '@app/sloka/sloka.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UtilityService } from '@app/services/utility.service';
import { SlokaData } from '@app/models/sloka-data.model';

beforeAll(() => {
  Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: jest.fn(),
  });
  Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
    configurable: true,
    value: jest.fn(),
  });
  Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: jest.fn().mockResolvedValue(undefined),
  });
});

describe('SingleSlokaComponent', () => {
  let component: SingleSlokaComponent;
  let fixture: ComponentFixture<SingleSlokaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        HttpClientTestingModule,
        SlokaComponent,
      ],
      providers: [UtilityService],
    }).compileComponents();

    fixture = TestBed.createComponent(SingleSlokaComponent);
    component = fixture.componentInstance;
    // Provide default inputs
    component.index = 0;
    component.sloka = { text: 'Sloka 1 text' } as SlokaData | null;
    component.expandedSloka = 0;
    component.chapterId = 1;
    component.showSanskrit = false;
    component.showSandhi = false;
    component.isSlokaGroupsReady = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit slokaToggle event when onToggle is called', () => {
    jest.spyOn(component.slokaToggle, 'emit');
    component.onToggle();
    expect(component.slokaToggle.emit).toHaveBeenCalledWith(0);
  });

  it('should return correct sloka title', () => {
    jest
      .spyOn(component['utilityService'], 'getSlokaTitle')
      .mockReturnValue('Sloka 1');
    expect(component.getSlokaTitle(0)).toBe('Sloka 1');
  });
});
