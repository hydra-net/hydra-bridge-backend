import { RouteId } from "../common/enums";
require("dotenv").config();
const { REACT_APP_ROUTE_POLYGON,  REACT_APP_ROUTE_HOP } = process.env;

export const getRouteFromId = (id?: string): string | undefined => {
  if (id && id === RouteId.polygon.toString()) {
    return REACT_APP_ROUTE_POLYGON;
  }

  if (id && id === RouteId.polygon.toString()) {
    return REACT_APP_ROUTE_HOP;
  }

  return undefined;
};
