export interface ProfessionSubCategory {
  id: number;
  name: string;
  professions: string[];
}

export interface ProfessionCategory {
  id: number;
  name: string;
  subCategories: ProfessionSubCategory[];
}
