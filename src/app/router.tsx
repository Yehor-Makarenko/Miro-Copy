import { createBrowserRouter, redirect } from "react-router";
import App from "./app";
import { ROUTES } from "@/shared/model/routes";

const PAGES = {
  BOARDS: "@/features/boards-list/board-list.page",
  BOARD: "@/features/board/board.page",
  LOGIN: "@/features/auth/login.page",
  REGISTER: "@/features/auth/register.page",
} as const;

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: ROUTES.BOARDS,
        lazy: () => getLazyComponent(PAGES.BOARDS),
      },
      {
        path: ROUTES.BOARD,
        lazy: () => getLazyComponent(PAGES.BOARD),
      },
      {
        path: ROUTES.LOGIN,
        lazy: () => getLazyComponent(PAGES.LOGIN),
      },
      {
        path: ROUTES.REGISTER,
        lazy: () => getLazyComponent(PAGES.REGISTER),
      },
      {
        path: ROUTES.HOME,
        loader: () => redirect(ROUTES.BOARDS),
      },
    ],
  },
]);

async function getLazyComponent<T extends keyof typeof PAGES>(
  path: (typeof PAGES)[T],
) {
  const module = (await import(path)) as { default: React.ComponentType };
  return { Component: module.default };
}
