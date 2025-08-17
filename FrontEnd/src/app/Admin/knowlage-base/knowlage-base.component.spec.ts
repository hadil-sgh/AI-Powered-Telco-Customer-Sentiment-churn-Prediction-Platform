import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowlageBaseComponent } from './knowlage-base.component';

describe('KnowlageBaseComponent', () => {
  let component: KnowlageBaseComponent;
  let fixture: ComponentFixture<KnowlageBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowlageBaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnowlageBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
