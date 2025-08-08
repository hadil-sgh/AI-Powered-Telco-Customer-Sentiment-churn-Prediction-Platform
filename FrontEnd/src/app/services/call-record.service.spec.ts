import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CallRecordService } from './call-record.service';

describe('CallRecordService', () => {
  let service: CallRecordService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CallRecordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
