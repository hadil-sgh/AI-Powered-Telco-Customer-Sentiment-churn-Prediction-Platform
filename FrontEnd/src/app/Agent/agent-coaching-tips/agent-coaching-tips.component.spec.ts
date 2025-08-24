import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentCoachingTipsComponent } from './agent-coaching-tips.component';

describe('AgentCoachingTipsComponent', () => {
  let component: AgentCoachingTipsComponent;
  let fixture: ComponentFixture<AgentCoachingTipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgentCoachingTipsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentCoachingTipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
