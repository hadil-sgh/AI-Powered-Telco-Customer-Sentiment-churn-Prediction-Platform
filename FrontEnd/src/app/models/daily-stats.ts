/* tslint:disable */
/* eslint-disable */
import { User } from './user';
export interface DailyStats {
  averageSentiment?: number;
  callsCompleted?: number;
  callsTarget?: number;
  coachingTipsUsed?: number;
  date?: string;
  escalations?: number;
  helpfulTips?: number;
  id?: number;
  totalScore?: number;
  user?: User;
}
