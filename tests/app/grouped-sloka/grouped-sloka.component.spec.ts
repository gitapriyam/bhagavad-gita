import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupedSlokaComponent } from '../../../src/app/grouped-sloka/grouped-sloka.component';
import { SlokaComponent } from '../../../src/app/sloka/sloka.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('GroupedSlokaComponent', () => {
  let component: GroupedSlokaComponent;
  let fixture: ComponentFixture<GroupedSlokaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        SlokaComponent,
        GroupedSlokaComponent,
        HttpClientTestingModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupedSlokaComponent);
    component = fixture.componentInstance;
    // Provide default inputs
    component.group = [0, 1];
    component.slokas = { 0: 'Sloka 1 text', 1: 'Sloka 2 text' };
    component.chapterId = 1;
    component.showSanskrit = false;
    component.showSandhi = false;
    component.isSlokaGroupsReady = true;
    component.expandedSloka = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit toggleGroup event when onToggleGroup is called', () => {
    jest.spyOn(component.toggleGroup, 'emit');
    component.onToggleGroup(1);
    expect(component.toggleGroup.emit).toHaveBeenCalledWith(1);
  });

  it('should return correct sloka title', () => {
    expect(component.getSlokaTitle(0)).toBe('Sloka 1');
    expect(component.getSlokaTitle(2)).toBe('Sloka 3');
  });
});
