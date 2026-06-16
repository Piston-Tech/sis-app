export default interface Session {
  id: number;
  sessionId: string;
  classId: number;
  date: Date;
  startTime: string;
  endTime: string;
  delivery: string;
  zoomLink: string;
  venueDetails: string;
  status: string;
  notes: string;
  createdAt?: Date;
  updatedAt?: Date;
}
