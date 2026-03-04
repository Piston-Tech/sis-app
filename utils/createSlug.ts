const createSlug = (name: string): string => {
  return name
    .toString() // Cast to string
    .normalize("NFD") // Split accented letters into base letter and accent
    .replace(/[\u0300-\u036f]/g, "") // Remove all previously split accents
    .toLowerCase() // Convert the string to lowercase letters
    .replace(/[^a-z0-9 -]/g, "") // Remove all non-alphanumeric characters except hyphens and spaces
    .trim() // Trim leading/trailing whitespace
    .replace(/\s+/g, "-") // Replace spaces with a single hyphen
    .replace(/-+/g, "-"); // Replace multiple hyphens with a single hyphen
};

export default createSlug;
