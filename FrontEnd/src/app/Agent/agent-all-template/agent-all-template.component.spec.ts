import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentAllTemplateComponent } from './agent-all-template.component';

describe('AgentAllTemplateComponent', () => {
  let component: AgentAllTemplateComponent;
  let fixture: ComponentFixture<AgentAllTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgentAllTemplateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentAllTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
