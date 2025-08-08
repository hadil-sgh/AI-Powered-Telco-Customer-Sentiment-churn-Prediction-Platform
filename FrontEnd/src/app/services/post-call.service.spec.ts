import { TestBed } from '@angular/core/testing';

import { PostCallService } from './post-call.service';

describe('PostCallService', () => {
  let service: PostCallService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostCallService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
