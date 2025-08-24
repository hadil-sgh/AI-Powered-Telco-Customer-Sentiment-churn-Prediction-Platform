import { TestBed } from '@angular/core/testing';

import { QuickTipsService } from './quick-tips.service';

describe('QuickTipsService', () => {
  let service: QuickTipsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuickTipsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
