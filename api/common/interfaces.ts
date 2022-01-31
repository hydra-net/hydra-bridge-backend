import { Query } from "express-serve-static-core";
import { Request } from "express";

export interface ReqQuery<T extends Query> extends Request {
  query: T;
}
