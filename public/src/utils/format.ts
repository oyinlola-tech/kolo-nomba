export const formatNaira = (value: number) => `₦${value.toLocaleString("en-NG")}`;

export const getInitials = (value: string) =>
  value
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
