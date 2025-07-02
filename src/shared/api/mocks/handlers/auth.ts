import { HttpResponse } from "msw";
import type { ApiSchemas } from "../../schema";
import { http } from "../http";
import {
  createRefreshTokenCookie,
  generateTokens,
  verifyToken,
} from "../session";

const mockUsers: ApiSchemas["User"][] = [
  {
    id: "User1",
    email: "admin@gmail.com",
  },
];

const userPasswords = new Map<string, string>();
userPasswords.set("admin@gmail.com", "123456");

export const authHandlers = [
  http.post("/auth/login", async (query) => {
    const data = await query.request.json();

    const user = mockUsers.find((u) => u.email === data.email);
    const storedPassword = userPasswords.get(data.email);

    if (!user || !storedPassword || storedPassword !== data.password) {
      return HttpResponse.json(
        {
          message: "Wrong email or password",
          code: "INVALID_CREDENTIALS",
        },
        {
          status: 401,
        },
      );
    }

    const { accessToken, refreshToken } = await generateTokens({
      userId: user.id,
      email: user.email,
    });

    return HttpResponse.json(
      {
        accessToken,
        user,
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": createRefreshTokenCookie(refreshToken),
        },
      },
    );
  }),

  http.post("/auth/register", async (query) => {
    const data = await query.request.json();

    if (mockUsers.some((u) => u.email === data.email)) {
      return HttpResponse.json(
        {
          message: "User with this email already exists",
          code: "USER_ALREADY_EXISTS",
        },
        {
          status: 400,
        },
      );
    }

    const user: ApiSchemas["User"] = {
      id: crypto.randomUUID(),
      email: data.email,
    };

    const { accessToken: token } = await generateTokens({
      userId: user.id,
      email: user.email,
    });
    mockUsers.push(user);
    userPasswords.set(data.email, data.password);
    return HttpResponse.json(
      {
        accessToken: token,
        user,
      },
      {
        status: 201,
        headers: {
          "Set-Cookie": createRefreshTokenCookie(token),
        },
      },
    );
  }),

  http.post("/auth/refresh", async (query) => {
    const refreshToken = query.cookies.refreshToken;

    if (!refreshToken) {
      return HttpResponse.json(
        {
          message: "Refresh token not found",
          code: "REFRESH_TOKEN_NOT_FOUND",
        },
        {
          status: 401,
        },
      );
    }

    try {
      const session = await verifyToken(refreshToken);
      const user = mockUsers.find((u) => u.id === session.userId);

      if (!user) {
        throw new Error("User not found");
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await generateTokens(session);

      return HttpResponse.json(
        {
          accessToken,
          user,
        },
        {
          status: 200,
          headers: {
            "Set-Cookie": createRefreshTokenCookie(newRefreshToken),
          },
        },
      );
    } catch {
      return HttpResponse.json(
        {
          message: "Invalid refresh token",
          code: "INVALID_REFRESH_TOKEN",
        },
        {
          status: 401,
        },
      );
    }
  }),
];
