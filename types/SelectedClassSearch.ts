interface SelectedClassSearch {
  id: number;
  classId: string;
  plannedStartDate: string;
  course: {
    title: string;
    code: string;
    levelId: number;
    duration: number;
    prices: Array<{
      tierId: number;
      tier: {
        id: number;
        name: string;
      };
      price: string;
      currency: string;
    }>;
  };
}

export default SelectedClassSearch;
