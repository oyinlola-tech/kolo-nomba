export const Roles = {
  SUPER_ADMIN: "SUPER_ADMIN",
  GROUP_ADMIN: "GROUP_ADMIN",
  MEMBER: "MEMBER",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
