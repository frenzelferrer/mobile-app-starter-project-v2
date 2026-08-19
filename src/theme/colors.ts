export const lightColors = {
  primary: "#3157D5",
  primaryDark: "#2444B1",
  accent: "#E9EEFF",
  background: "#F6F8FC",
  surface: "#FFFFFF",
  text: "#17213A",
  muted: "#6B7692",
  border: "#E1E6F0",
  success: "#1B9B68",
  successSoft: "#E6F7EF",
  warning: "#B97812",
  warningSoft: "#FFF4DE",
  danger: "#C24155",
  dangerSoft: "#FDECEF",
  white: "#FFFFFF",
} as const;

export const darkColors = {
  primary: "#8EA5FF",
  primaryDark: "#6F89F0",
  accent: "#26345F",
  background: "#101522",
  surface: "#1A2233",
  text: "#F4F6FF",
  muted: "#AAB4CF",
  border: "#303B55",
  success: "#55D59B",
  successSoft: "#1E4438",
  warning: "#F6C76A",
  warningSoft: "#4B3B1D",
  danger: "#FF8D9B",
  dangerSoft: "#4A2730",
  white: "#FFFFFF",
} as const;

export type AppColors = { [Key in keyof typeof lightColors]: string };
export const spacing = { xs: 6, sm: 10, md: 16, lg: 22, xl: 30 } as const;
