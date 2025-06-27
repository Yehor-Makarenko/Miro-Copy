import "react-router";
import { href } from "react-router";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  BOARDS: "/boards",
  BOARD: "/boards/:boardId",
} as const;

export type PathParams = {
  [ROUTES.BOARD]: {
    boardId: string;
  };
};

export function typedHref<T extends keyof PathParams>(
  path: T,
  params: PathParams[T],
) {
  return href(path, params);
}
