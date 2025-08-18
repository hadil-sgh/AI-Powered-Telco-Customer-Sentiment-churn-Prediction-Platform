/* tslint:disable */
/* eslint-disable */
import { CallRecord } from './call-record';

export interface SentimentPoint {
  id?: number;
  call?: CallRecord;
  sentimentScore?: number;
  context?: string;
}