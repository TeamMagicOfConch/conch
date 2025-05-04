import { FC, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Download, LogOut, Shell } from 'lucide-react';
import { clearAuthToken } from '@api/admin';

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // 토큰 제거
    clearAuthToken();
    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem('adminToken');
    // 로그인 페이지로 이동
    navigate('/signin');
  };

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="w-48 bg-white border-r border-black flex flex-col items-start">
        <div className="w-full p-6 flex items-center">
          <Shell className="w-8 h-8 text-black" />
        </div>
        <div className="flex flex-col space-y-4 w-full p-4">
          <button
            onClick={() => navigate('/decrypt')}
            className={`p-3 rounded-lg w-full flex items-center gap-3 ${
              location.pathname === '/decrypt' ? 'bg-black text-white' : 'hover:bg-black/5'
            }`}
          >
            <Lock className={`w-5 h-5`} />
            <span>복호화</span>
          </button>
          <button
            onClick={() => navigate('/download')}
            className={`p-3 rounded-lg w-full flex items-center gap-3 ${
              location.pathname === '/download' ? 'bg-black text-white' : 'hover:bg-black/5'
            }`}
          >
            <Download className={`w-5 h-5`} />
            <span>파일 다운</span>
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="p-3 rounded-lg hover:bg-black/5 mt-auto w-full flex items-center gap-3 px-7 mb-8"
        >
          <LogOut className="w-5 h-5" />
          <span>로그아웃</span>
        </button>
      </aside>
      <main className="flex-1 bg-white">{children}</main>
    </div>
  );
};

export default Layout;