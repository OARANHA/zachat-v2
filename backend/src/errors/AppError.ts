/**
 * Custom Application Error
 * 
 * © 2024 28web. Todos os direitos reservados.
 */
class AppError {
  public readonly message: string;

  public readonly statusCode: number;

  public readonly code?: string;

  public readonly metadata?: Record<string, any>;

  constructor(
    message: string, 
    statusCode: number = 400,
    code?: string,
    metadata?: Record<string, any>
  ) {
    this.message = message;
    this.statusCode = statusCode;
    this.code = code;
    this.metadata = metadata;
  }
}

export default AppError;
