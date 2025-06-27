import { createBrowserRouter, redirect } from "react-router";
import App from "./app";
import { ROUTES } from "@/shared/model/routes";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      // {
      //   path: ROUTES.BOARDS,
      //   lazy: () => import("@/features/"),
      // },
      // {
      //   path: ROUTES.BOARD,
      //   lazy: () => import("@/features/"),
      // },
      // {
      //   path: ROUTES.LOGIN,
      //   lazy: () => import("@/features/"),
      // },
      // {
      //   path: ROUTES.REGISTER,
      //   lazy: () => import("@/features/"),
      // },
      {
        path: ROUTES.HOME,
        loader: () => redirect(ROUTES.BOARDS),
      },
    ],
  },
]);
