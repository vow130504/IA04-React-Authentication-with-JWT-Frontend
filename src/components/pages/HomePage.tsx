// frontend/src/components/pages/HomePage.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';
import { useAuth } from '@/hooks/useAuth'; // Dùng để lấy email nhanh (tùy chọn)

type User = { id: string; email: string };

// Hàm fetcher cho useQuery
const fetchMe = async (): Promise<User> => {
  const { data } = await axiosInstance.get('/user/me');
  return data;
};

const HomePage: React.FC = () => {
  // Lấy user từ context (để hiển thị ngay lập tức)
  const { user: userFromContext } = useAuth();

  // Hoặc dùng useQuery để fetch dữ liệu mới từ endpoint được bảo vệ
  // Đây là cách tốt nhất để kiểm tra access token
  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = useQuery<User, Error>({
    queryKey: ['me'],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });

  const displayUser = userData || userFromContext;

  const renderContent = () => {
    if (isLoading) return <p>Đang tải thông tin người dùng...</p>;
    if (isError) return <p className='text-red-500'>Lỗi: {error.message}</p>;
    if (displayUser) {
      return (
        <div className="inline-flex items-center px-5 py-3 sm:px-6 sm:py-3.5 md:px-6 md:py-3.5 bg-white/70 dark:bg-gray-700/60 backdrop-blur text-gray-900 dark:text-white rounded-lg font-semibold text-sm sm:text-base border border-white/40 dark:border-white/10 shadow-lg">
          {displayUser.email} (Đã xác thực)
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative isolate w-full overflow-hidden shadow-lg flex items-center justify-center rounded-xl sm:rounded-2xl lg:rounded-3xl min-h-[40vh] sm:min-h-[45vh] md:min-h-[50vh] lg:min-h-[55vh] max-h-[80vh]">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506765515384-028b60a970df?q=80&w=1600&auto=format&fit=crop')",
        }}
        role="img"
        aria-label="Background"
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-white/80 via-white/40 to-white/20 dark:from-gray-900/80 dark:via-gray-900/50 dark:to-gray-900/20 backdrop-blur-[2px] pointer-events-none" />
      <div className="relative z-20 w-[92%] max-w-2xl p-4 sm:p-6 md:p-8 rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/40 dark:border-white/10 text-center mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Chào mừng bạn!
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 mb-6 sm:mb-8">
          Đây là trang chủ được bảo vệ.
        </p>
        {renderContent()}
      </div>
    </div>
  );
};

export default HomePage;