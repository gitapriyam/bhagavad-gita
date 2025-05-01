import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlokaComponent } from './sloka.component';

describe('SlokaComponent', () => {
  let component: SlokaComponent;
  let fixture: ComponentFixture<SlokaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SlokaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlokaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
