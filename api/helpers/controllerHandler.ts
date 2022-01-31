import { ServiceResponseDto } from "../common/dtos";
import { Response } from "express";
import { consoleLogger, hydraLogger } from "./hydraLogger";

export const handleResponse = <T>(
  resp: Response,
  result: ServiceResponseDto<T>
) => {
  try {
    if (result.status === 200) {
      resp.status(200).json(result.data);
    }

    if (result.status === 400) {
      resp.status(400).send(result.message);
    }

    if (result.status === 404) {
      resp.status(404).send(result.message);
    }

    if (result.status === 500) {
      resp.status(500).send(result.message);
    }

    return resp;
  } catch (e) {
    consoleLogger.error(e);
    hydraLogger.error(e);
  }
};
