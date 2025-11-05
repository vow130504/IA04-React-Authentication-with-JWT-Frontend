// frontend/src/services/token.service.ts

/**
 * Service quản lý token:
 * - Access Token: Lưu trữ trong memory (biến)
 * - Refresh Token: Lưu trữ trong localStorage (persistent)
 */

class TokenService {
  private accessToken: string | null = null;

  // Access Token (In-memory)
  getAccessToken(): string | null {
    return this.accessToken;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  // Refresh Token (LocalStorage)
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
  }

  // Xoá tất cả token (logout)
  clearTokens(): void {
    this.accessToken = null;
    localStorage.removeItem('refreshToken');
  }
}

// Xuất ra một instance duy nhất (Singleton pattern)
export const tokenService = new TokenService();