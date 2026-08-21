import { createNavigationContainerRef } from "@react-navigation/native";
import type { RootTabParamList } from "./navigationTypes";

export const navigationRef = createNavigationContainerRef<RootTabParamList>();
