export const lightColors = {
  primary: "#1736C8",
  primaryDark: "#102A9E",
  accent: "#EAF0FF",
  background: "#F7F9FC",
  surface: "#FFFFFF",
  text: "#172033",
  muted: "#667085",
  border: "#E4E7EC",
  success: "#0DBAA5",
  successSoft: "#E4FAF6",
  warning: "#F79009",
  warningSoft: "#FFF4DE",
  danger: "#D92D20",
  dangerSoft: "#FDECEA",
  white: "#FFFFFF",
} as const;

export const darkColors = {
  primary: "#8296FF",
  primaryDark: "#6F84F0",
  accent: "#26376F",
  background: "#101522",
  surface: "#1A2233",
  text: "#F4F6FF",
  muted: "#AAB4CF",
  border: "#303B55",
  success: "#39D0BA",
  successSoft: "#1D4B45",
  warning: "#F6C76A",
  warningSoft: "#4B3B1D",
  danger: "#FF8D80",
  dangerSoft: "#4A2730",
  white: "#FFFFFF",
} as const;

export type AppColors = { [Key in keyof typeof lightColors]: string };
export const spacing = { xs: 6, sm: 10, md: 16, lg: 22, xl: 30 } as const;
