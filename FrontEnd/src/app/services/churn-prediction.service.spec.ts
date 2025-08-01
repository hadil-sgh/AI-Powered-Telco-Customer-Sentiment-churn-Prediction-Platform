import { TestBed } from '@angular/core/testing';

import { ChurnPredictionService } from './churn-prediction.service';

describe('ChurnPredictionService', () => {
  let service: ChurnPredictionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChurnPredictionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
