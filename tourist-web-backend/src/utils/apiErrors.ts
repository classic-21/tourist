export class APIErrors extends Error {
  public statusCode: number;
  constructor(error: { statusCode: number; message: string }) {
    super(error.message);
    this.statusCode = error.statusCode; // Set the status code here
    this.message = error?.message;
  }
}
