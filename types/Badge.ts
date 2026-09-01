interface Badge {
  id: number;
  enrollmentId: string;
  courseTitle: string;
  issueDate: string;
  issued: boolean;
  owing: boolean;
  preview: string;
  download: string;
  transaction: {
    id: number;
    total: string;
    discount: string;
    totalPaid: string;
  };
}

export default Badge;
