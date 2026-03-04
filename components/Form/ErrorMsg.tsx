const ErrorMsg = ({ message }: { message: string | undefined | null }) => {
  return (
    message && (
      <p className="text-red-400 text-sm mx-2 mt-1 text-center">{message}</p>
    )
  );
};

export default ErrorMsg;
