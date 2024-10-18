import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RevenueDistrictComponent } from './revenue-district.component';

describe('RevenueDistrictComponent', () => {
  let component: RevenueDistrictComponent;
  let fixture: ComponentFixture<RevenueDistrictComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevenueDistrictComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RevenueDistrictComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
