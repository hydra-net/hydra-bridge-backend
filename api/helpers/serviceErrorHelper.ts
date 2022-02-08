import { ServiceResponseDto } from "../common/dtos";

export const BadRequest = <T>(
  message = "Bad request"
): ServiceResponseDto<T> => {
  return {
    status: 400,
    message: message,
  };
};

export const Unauthorized = <T>(
  message = "Unauthorized"
): ServiceResponseDto<T> => {
  return {
    status: 401,
    message: message,
  };
};

export const Forbidden = <T>(message = "Forbidden"): ServiceResponseDto<T> => {
  return {
    status: 403,
    message: message,
  };
};

export const NotFound = <T>(message = "Not found"): ServiceResponseDto<T> => {
  return {
    status: 404,
    message: message,
  };
};

export const Conflict = <T>(
  message = "Conflict in current state"
): ServiceResponseDto<T> => {
  return {
    status: 409,
    message: message,
  };
};

export const ServerError = <T>(
  message = "Server error"
): ServiceResponseDto<T> => {
  return {
    status: 500,
    message: message,
  };
};
