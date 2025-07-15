import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallManagmentComponent } from './call-managment.component';

describe('CallManagmentComponent', () => {
  let component: CallManagmentComponent;
  let fixture: ComponentFixture<CallManagmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallManagmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallManagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
