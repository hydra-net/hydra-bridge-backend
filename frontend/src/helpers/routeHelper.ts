import { RouteId } from "../common/enums";
require("dotenv").config();
const { REACT_APP_ROUTE_POLYGON,  REACT_APP_ROUTE_HOP } = process.env;

export const getRouteFromId = (id?: RouteId): string | undefined => {
  if (id && id.toString() === RouteId.Polygon.toString()) {
    return REACT_APP_ROUTE_POLYGON;
  }

  if (id && id.toString() === RouteId.Polygon.toString()) {
    return REACT_APP_ROUTE_HOP;
  }

  return undefined;
};
