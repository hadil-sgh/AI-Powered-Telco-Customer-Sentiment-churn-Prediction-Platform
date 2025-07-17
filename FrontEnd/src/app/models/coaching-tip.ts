import { User } from "./user";

export enum TipType {
  SENTIMENT_ALERT = 'SENTIMENT_ALERT',
  COMPETITOR_MENTION = 'COMPETITOR_MENTION',
  ESCALATION_RISK = 'ESCALATION_RISK',
  TECHNIQUE_SUGGESTION = 'TECHNIQUE_SUGGESTION',

}



export interface CoachingTip {
  id?: number;
  title: string;
  message: string;
  type: TipType;
  user?: User;
  manager?: User;
  acknowledged?: boolean;
  helpful?: boolean;
  shownAt?: string;
  acknowledgedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}