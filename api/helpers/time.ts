export const getTimestamp = (days?: number) => {
  const date = new Date();
  if (days) {
    date.setDate(date.getDate() + days);
  }

  return date.getTime();
};
