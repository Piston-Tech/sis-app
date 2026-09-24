const handleRequestError = (
  e: any,
  setError: (error: string) => void,
  setErrors: (errors: any) => void,
) => {
  const { errors, error } = e?.response?.data ?? {};

  if (errors) {
    setErrors(errors);
  } else {
    setError(error || e?.message || "Network error");
  }
};

export default handleRequestError;
