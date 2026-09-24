const ErrorMsg = ({
  message,
  id,
}: {
  message: string | undefined | null;
  id?: string;
}) => {
  return message ? (
    <p id={id} className="text-red-400 text-sm mx-2 mt-1 text-center">
      {message}
    </p>
  ) : null;
};

export default ErrorMsg;
