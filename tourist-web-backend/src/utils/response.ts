export function createResponseObject(
  statusCode: number,
  message: string,
  data?: any
) {
  return {
    statusCode,
    message,
    data,
  };
}
