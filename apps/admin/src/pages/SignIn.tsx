import { KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/decrypt');
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
              className="w-full px-4 py-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="ID"
            />
            <input
              type="password"
              required
              className="w-full px-4 py-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;