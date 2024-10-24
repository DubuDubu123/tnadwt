import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CasteAndCommunityComponent } from './caste-and-community.component';

describe('CasteAndCommunityComponent', () => {
  let component: CasteAndCommunityComponent;
  let fixture: ComponentFixture<CasteAndCommunityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CasteAndCommunityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CasteAndCommunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
