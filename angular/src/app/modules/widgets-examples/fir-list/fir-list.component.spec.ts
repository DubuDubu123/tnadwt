import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirListComponent } from './fir-list.component';

describe('FirListComponent', () => {
  let component: FirListComponent;
  let fixture: ComponentFixture<FirListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
