import z from "zod";

export abstract class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }

  public abstract toJSON(): Record<string, unknown>;
}

export class NotFoundError extends AppError {
  constructor(
    message: string,
    public readonly resource: string,
    public readonly identifier?: string
  ) {
    super(message, 404);
  }

  public override toJSON() {
    return {
      message: this.message,
      resource: this.resource,
      identifier: this.identifier,
    };
  }
}

export type NotFoundErrorJSON = ReturnType<
  typeof NotFoundError.prototype.toJSON
>;

export class BadRequestError extends AppError {
  constructor(
    message: string,
    public readonly metadata?: Record<string, unknown>
  ) {
    super(message, 400);
  }

  public override toJSON() {
    return {
      message: this.message,
      metadata: this.metadata,
    };
  }
}

export type BadRequestErrorJSON = ReturnType<
  typeof BadRequestError.prototype.toJSON
>;

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly errors: z.ZodError
  ) {
    super(message, 400);
  }

  public override toJSON() {
    return {
      message: this.message,
      errors: this.errors.issues,
    };
  }
}

export type ValidationErrorJSON = ReturnType<
  typeof ValidationError.prototype.toJSON
>;

export class InternalServerError extends AppError {
  constructor(message: string) {
    super(message, 500);
  }

  public override toJSON() {
    return {
      message: this.message,
    };
  }
}

export type InternalServerErrorJSON = ReturnType<
  typeof InternalServerError.prototype.toJSON
>;

export class UnauthorizedError extends AppError {
  constructor(
    message: string,
    public readonly scope: string,
    public readonly identifier?: string
  ) {
    super(message, 401);
  }

  public override toJSON() {
    return {
      message: this.message,
      scope: this.scope,
      identifier: this.identifier,
    };
  }
}

export type UnauthorizedErrorJSON = ReturnType<
  typeof UnauthorizedError.prototype.toJSON
>;
