// export const isEmpty = (value: string): boolean =>
//   typeof value === "undefined" || value === "undefined" || value === "null" || value === null || value === "";
export const isEmpty = (str: string) => {
  return !str || /^\s*$/.test(str) || str.length === 0;
};
