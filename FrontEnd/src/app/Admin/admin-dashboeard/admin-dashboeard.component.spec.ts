import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashboeardComponent } from './admin-dashboeard.component';

describe('AdminDashboeardComponent', () => {
  let component: AdminDashboeardComponent;
  let fixture: ComponentFixture<AdminDashboeardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminDashboeardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDashboeardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
