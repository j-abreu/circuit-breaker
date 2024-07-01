export function buildErrorResponse(code: number, message: string) {
  return {
    status: 'Error',
    code,
    message,
    data: null,
  };
}
