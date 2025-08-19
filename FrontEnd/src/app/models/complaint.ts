export interface Complaint {
  id: number;
  complaintType: string;
  summary: string;
  callTranscripts?: any; // Optional call record reference
}

export interface ComplaintStats {
  type: string;
  count: number;
  percentage: number;
}
