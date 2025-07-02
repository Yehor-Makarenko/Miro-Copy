import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { createGStore } from "create-gstore";
import { publicFetchClient } from "../api/instance";

type Session = {
  userId: string;
  email: string;
  exp: number;
  iat: number;
};

let refreshTokenPromise: Promise<string | null> | null = null;

const TOKEN_KEY = "token";
export const useSession = createGStore(() => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const login = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  const session = token ? jwtDecode<Session>(token) : null;

  const refreshToken = async () => {
    if (!session) {
      return null;
    }

    if (session.exp > Date.now() / 1000 + 1) {
      return token;
    }

    if (refreshTokenPromise) {
      return await refreshTokenPromise;
    }

    try {
      const getNewToken = async () => {
        const response = await publicFetchClient.POST("/auth/refresh");
        const newToken = response.data?.accessToken ?? null;
        return newToken;
      };
      refreshTokenPromise = getNewToken();
      const newToken = await refreshTokenPromise;
      if (newToken) {
        login(newToken);
      } else {
        logout();
      }
      return newToken;
    } finally {
      refreshTokenPromise = null;
    }
  };

  return { refreshToken, login, logout, session };
});
