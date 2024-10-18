import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffenceActScstComponent } from './offence-act-scst.component';

describe('OffenceActScstComponent', () => {
  let component: OffenceActScstComponent;
  let fixture: ComponentFixture<OffenceActScstComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffenceActScstComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffenceActScstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
