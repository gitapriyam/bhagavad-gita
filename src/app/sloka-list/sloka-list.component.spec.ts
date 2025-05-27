import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SlokaListComponent } from './sloka-list.component';

describe('SlokaListComponent', () => {
  let component: SlokaListComponent;
  let fixture: ComponentFixture<SlokaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [],
    }).compileComponents();

    fixture = TestBed.createComponent(SlokaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
