export class NonRetryableBackgroundJobError extends Error {
  public constructor(
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
  }
}
