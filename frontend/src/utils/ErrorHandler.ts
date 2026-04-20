export function handleError(error: unknown) {
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: String(error) };
}
