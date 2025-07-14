/* tslint:disable */
/* eslint-disable */
import { CallRecord } from './call-record';
import { TranscriptSentiment } from './transcript-sentiment';
import { VoiceFeatures } from './voice-features';
export interface AudioAnalysisResponse {
  callRecord?: CallRecord;
  id?: number;
  sentiment?: TranscriptSentiment;
  speaker?: string;
  text?: string;
  timestamp?: string;
  voiceFeatures?: VoiceFeatures;
}
