import type { NavigatorScreenParams } from "@react-navigation/native";

export type TasksStackParamList = {
  TaskList: undefined;
  AddTask: undefined;
  TaskDetails: { taskId: string };
  EditTask: { taskId: string };
};

export type RootTabParamList = {
  Home: undefined;
  Tasks: NavigatorScreenParams<TasksStackParamList>;
  Profile: undefined;
};
