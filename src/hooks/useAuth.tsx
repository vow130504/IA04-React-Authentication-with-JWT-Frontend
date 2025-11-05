// frontend/src/hooks/useAuth.tsx
import React from 'react';
import type { ReactNode } from 'react';
import {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

import type {
  QueryKey,
} from '@tanstack/react-query';
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import { tokenService } from '@/services/token.service';
import axiosInstance from '@/lib/axiosInstance';
import { useNavigate } from 'react-router-dom';

// Định nghĩa kiểu dữ liệu
type User = { id: string; email: string };
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<any>;
  logout: () => void;
  loginMutation: {
    isPending: boolean;
    isError: boolean;
    error: Error | null;
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ME_QUERY_KEY: QueryKey = ['me'];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading trạng thái auth ban đầu
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // 1. Hook (Query) để lấy thông tin user nếu có refresh token
  const {
    data: meData,
    isFetching: isMeFetching,
    isSuccess: isMeSuccess,
    isError: isMeError,
  } = useQuery<User>({
    queryKey: ME_QUERY_KEY,
    queryFn: async () => {
      const { data } = await axiosInstance.get('/user/me');
      return data;
    },
    enabled: !!tokenService.getRefreshToken(), // Chỉ chạy khi có refresh token
    retry: 1, // Thử lại 1 lần nếu lỗi
    staleTime: Infinity, // Dữ liệu user không bao giờ cũ
    gcTime: Infinity,
  });

  // 2. Xử lý trạng thái auth ban đầu
  useEffect(() => {
    if (!tokenService.getRefreshToken()) {
      setIsLoading(false); // Không có token, không cần load
      return;
    }
    // Nếu đang fetch
    if (isMeFetching) {
      setIsLoading(true);
    }
    // Nếu fetch thành công
    if (isMeSuccess && meData) {
      setUser(meData);
      setIsLoading(false);
    }
    // Nếu fetch lỗi (token hết hạn, v.v.)
    if (isMeError) {
      tokenService.clearTokens();
      setIsLoading(false);
    }
  }, [isMeFetching, isMeSuccess, isMeError, meData]);

  // 3. Hook (Mutation) cho Login (Requirement 4 & 5)
  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await axiosInstance.post('/user/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      // Lưu token (Requirement 2)
      tokenService.setAccessToken(data.accessToken);
      tokenService.setRefreshToken(data.refreshToken);
      // Cập nhật state
      setUser(data.user);
      // Invalidate query 'me' (không cần thiết vì đã set user, nhưng tốt cho sync)
      queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
      // Chuyển hướng về trang chủ
      navigate('/homepage');
    },
    onError: () => {
      // Xử lý lỗi (sẽ hiển thị ở form)
    },
  });

  // 4. Hàm Logout (Requirement 2)
  const logout = () => {
    // TODO: Gọi API /logout nếu backend có hỗ trợ
    tokenService.clearTokens();
    setUser(null);
    queryClient.setQueryData(ME_QUERY_KEY, null); // Xoá cache user
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading, // Trạng thái loading ban đầu
    login: loginMutation.mutateAsync,
    logout,
    loginMutation: {
      isPending: loginMutation.isPending,
      isError: loginMutation.isError,
      error: loginMutation.error,
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook để sử dụng context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};