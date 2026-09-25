export interface CourseLevel {
  id?: number;
  name: string;
  /** Prices for this level at the course's duration (public catalogue) */
  prices?: { price: number | string }[];
}

export default interface Course {
  id: number;
  code: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  subCategory: string;
  /** Included by the API as an association, not a plain string */
  level?: CourseLevel;
  link: string;
  createdAt?: Date;
  updatedAt?: Date;
}
