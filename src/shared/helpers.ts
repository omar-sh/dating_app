import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';

export const flattenErrors = (errors: ValidationError[]): string[] => {
  return errors
    .flat()
    .map((error) => {
      return Object.values(error.constraints!);
    })
    .flat();
};

export const validateData = async <T extends object>(
  input: T,
  c: ClassConstructor<T>,
): Promise<string[]> => {
  return flattenErrors(await validate(plainToInstance(c, input)));
};

export const formatJSONResponse = (
  statusCode: number,
  response: Record<string, unknown>,
) => {
  return {
    statusCode,
    body: JSON.stringify({ code: statusCode, ...response }),
  };
};
