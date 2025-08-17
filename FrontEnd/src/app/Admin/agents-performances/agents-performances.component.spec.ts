import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentsPerformancesComponent } from './agents-performances.component';

describe('AgentsPerformancesComponent', () => {
  let component: AgentsPerformancesComponent;
  let fixture: ComponentFixture<AgentsPerformancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgentsPerformancesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentsPerformancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
