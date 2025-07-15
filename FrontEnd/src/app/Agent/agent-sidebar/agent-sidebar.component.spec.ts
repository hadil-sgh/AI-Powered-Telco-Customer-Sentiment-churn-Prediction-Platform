import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentSidebarComponent } from './agent-sidebar.component';

describe('AgentSidebarComponent', () => {
  let component: AgentSidebarComponent;
  let fixture: ComponentFixture<AgentSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgentSidebarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
