export default interface CustomClass {
  id: number;
  customClassId: string;
  classId: number;
  title: string;
  description: string;
  instructions: string;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}
