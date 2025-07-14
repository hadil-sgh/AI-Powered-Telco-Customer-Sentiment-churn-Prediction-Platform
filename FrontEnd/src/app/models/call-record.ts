/* tslint:disable */
/* eslint-disable */
import { AudioAnalysisResponse } from './audio-analysis-response';
import { Customer } from './customer';
import { User } from './user';
export interface CallRecord {
  agent?: User;
  callDateTime?: string;
  callDuration?: {
'seconds'?: number;
'nano'?: number;
'negative'?: boolean;
'zero'?: boolean;
'units'?: Array<{
'dateBased'?: boolean;
'timeBased'?: boolean;
'durationEstimated'?: boolean;
}>;
};
  callOutcome?: 'SUCCESSFUL' | 'NO_ANSWER' | 'DROPPED' | 'RESOLVED';
  callTranscripts?: Array<AudioAnalysisResponse>;
  customer?: Customer;
  id?: number;
}
