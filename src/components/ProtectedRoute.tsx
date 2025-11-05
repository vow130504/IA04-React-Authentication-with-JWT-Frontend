// frontend/src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Hiển thị loading spinner trong khi kiểm tra auth
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        Đang tải...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, điều hướng về trang login
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, hiển thị nội dung của route
  return <Outlet />;
};

export default ProtectedRoute;