import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SlokaComponent } from '../../../src/app/sloka/sloka.component';

describe('SlokaComponent', () => {
  let component: SlokaComponent;
  let fixture: ComponentFixture<SlokaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [],
    }).compileComponents();

    fixture = TestBed.createComponent(SlokaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
