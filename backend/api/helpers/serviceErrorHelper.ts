import { ServiceResponseDto } from "../common/dtos";

export const NotFound = (): ServiceResponseDto => {
  return {
    status: 404,
    message: "Not found",
  };
};

export const BadRequest = (message = "Bad request") => {
  return {
    status: 400,
    message: message,
  };
};

export const ServerError = (message = "Server error") => {
  return {
    status: 500,
    message: message,
  };
};
