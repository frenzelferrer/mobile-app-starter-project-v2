import type { NavigatorScreenParams } from "@react-navigation/native";

export type TasksStackParamList = {
  TaskList: undefined;
  AddTask: undefined;
  TaskDetails: { taskId: string };
  EditTask: { taskId: string };
  FocusTimer: { taskId: string };
  Timeline: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Tasks: NavigatorScreenParams<TasksStackParamList>;
  Insights: undefined;
  Profile: undefined;
};
