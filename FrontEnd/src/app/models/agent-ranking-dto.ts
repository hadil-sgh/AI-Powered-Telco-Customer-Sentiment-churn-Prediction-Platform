export interface AgentRankingDTO {
  rank: number;
  agentName: string;
  score: number;
  userEmail?: string;
  totalScore?: number;
  callsCompleted?: number;
  averageSentiment?: number;
}
