export default interface Class {
  id: number;
  classId: string;
  courseId: number;
  plannedStartDate: Date;
  schedule: string;
  isCustom: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
