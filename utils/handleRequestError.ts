const handleRequestError = (
  e: any,
  setError: (error: string) => void,
  setErrors: (errors: any) => void,
) => {
  const {
    response: {
      data: { errors, error },
    },
  } = e;

  if (errors) {
    setErrors(errors);
  } else if (error) {
    setError(error);
  }
};

export default handleRequestError;
