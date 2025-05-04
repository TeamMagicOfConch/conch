import { KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { adminSwaggerClient, setAuthToken } from '@api/admin';

const SignIn = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await adminSwaggerClient.adminLoginController.login(
        { adminName, password }
      );
      
      // 응답에서 토큰을 추출하고 저장
      const token = response.data as any;
      
      if (token) {
        // 토큰 설정
        setAuthToken(token.accessToken || token);
        // 로컬 스토리지에 토큰 저장
        localStorage.setItem('adminToken', JSON.stringify(token));
        // 복호화 페이지로 이동
        navigate('/decrypt');
      } else {
        setError('로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      setError('로그인에 실패했습니다. ID와 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="flex flex-col items-center">
          <KeyRound className="w-12 h-12 text-black" />
          <h2 className="mt-6 text-2xl font-bold text-black">소라고동 Admin</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="space-y-4">
            <input
              type="text"
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full px-4 py-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="ID"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Password"
            />
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-black text-white rounded-lg hover:bg-black/90 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? '로그인 중...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;