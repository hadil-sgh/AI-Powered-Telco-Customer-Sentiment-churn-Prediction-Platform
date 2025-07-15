import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostCallComponent } from './post-call.component';

describe('PostCallComponent', () => {
  let component: PostCallComponent;
  let fixture: ComponentFixture<PostCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostCallComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
