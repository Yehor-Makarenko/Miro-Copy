import { createBrowserRouter, redirect } from "react-router";
import App from "./app";
import { ROUTES } from "@/shared/model/routes";
import { Providers } from "./providers";

const PAGES = {
  LOGIN: () => import("@/features/auth/login.page"),
  REGISTER: () => import("@/features/auth/register.page"),
  BOARDS: () => import("@/features/boards-list/board-list.page"),
  BOARD: () => import("@/features/board/board.page"),
} as const;

export const router = createBrowserRouter([
  {
    element: (
      <Providers>
        <App />
      </Providers>
    ),
    children: [
      {
        path: ROUTES.BOARDS,
        lazy: () => getLazyComponent("BOARDS"),
      },
      {
        path: ROUTES.BOARD,
        lazy: () => getLazyComponent("BOARD"),
      },
      {
        path: ROUTES.LOGIN,
        lazy: () => getLazyComponent("LOGIN"),
      },
      {
        path: ROUTES.REGISTER,
        lazy: () => getLazyComponent("REGISTER"),
      },
      {
        path: ROUTES.HOME,
        loader: () => redirect(ROUTES.BOARDS),
      },
    ],
  },
]);

async function getLazyComponent<T extends keyof typeof PAGES>(path: T) {
  const module = (await PAGES[path]()) as { default: React.ComponentType };
  return { Component: module.default };
}
