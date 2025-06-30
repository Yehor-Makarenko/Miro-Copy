import { HttpResponse } from "msw";
import type { ApiSchemas } from "../../schema";
import { http } from "../http";

const mockUsers: ApiSchemas["User"][] = [
  {
    id: "User1",
    email: "Z4C0a@example.com",
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

    const token = `mock-token-${Date.now()}`;
    return HttpResponse.json(
      {
        accessToken: token,
        user,
      },
      {
        status: 200,
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
    const token = `mock-token-${Date.now()}`;
    mockUsers.push(user);
    userPasswords.set(data.email, data.password);
    return HttpResponse.json(
      {
        accessToken: token,
        user,
      },
      {
        status: 201,
      },
    );
  }),
];
