export default interface Course {
  id: number;
  code: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  subCategory: string;
  level: string;
  link: string;
  createdAt?: Date;
  updatedAt?: Date;
}
