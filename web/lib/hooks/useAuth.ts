"use client";

import { useState, useEffect, useCallback } from "react";
import { authApi, UserProfile, LoginRequest } from "@/lib/api/auth";
import { tokenStore } from "@/lib/auth/token";

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isLoggedIn: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isLoggedIn: false,
  });

  // 初始化时尝试获取当前用户信息
  useEffect(() => {
    if (!tokenStore.isLoggedIn()) {
      setState({ user: null, isLoading: false, isLoggedIn: false });
      return;
    }

    authApi
      .getProfile()
      .then((user) => {
        setState({ user, isLoading: false, isLoggedIn: true });
      })
      .catch(() => {
        tokenStore.clearTokens();
        setState({ user: null, isLoading: false, isLoggedIn: false });
      });
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await authApi.login(data);
    tokenStore.setTokens(res.access_token, res.refresh_token);
    setState({ user: res.user, isLoading: false, isLoggedIn: true });
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      tokenStore.clearTokens();
      setState({ user: null, isLoading: false, isLoggedIn: false });
    }
  }, []);

  return { ...state, login, logout };
}
