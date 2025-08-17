import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickTipsComponent } from './quick-tips.component';

describe('QuickTipsComponent', () => {
  let component: QuickTipsComponent;
  let fixture: ComponentFixture<QuickTipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuickTipsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickTipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
