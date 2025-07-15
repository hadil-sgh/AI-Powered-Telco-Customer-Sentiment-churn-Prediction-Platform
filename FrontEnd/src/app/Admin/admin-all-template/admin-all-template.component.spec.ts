import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAllTemplateComponent } from './admin-all-template.component';

describe('AdminAllTemplateComponent', () => {
  let component: AdminAllTemplateComponent;
  let fixture: ComponentFixture<AdminAllTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAllTemplateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAllTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
