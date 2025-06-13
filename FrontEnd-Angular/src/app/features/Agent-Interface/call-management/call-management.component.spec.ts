import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallManagementComponent } from './call-management.component';

describe('CallManagementComponent', () => {
  let component: CallManagementComponent;
  let fixture: ComponentFixture<CallManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CallManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
