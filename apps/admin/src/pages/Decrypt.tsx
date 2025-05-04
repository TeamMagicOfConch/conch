import { useState } from 'react';
import Layout from '../components/Layout';
import { adminSwaggerClient } from '@api/admin';

const Decrypt = () => {
  const [encryptedText, setEncryptedText] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDecrypt = async () => {
    if (!encryptedText.trim()) {
      setError('복호화할 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 암호화된 텍스트를 객체로 변환 (JSON 문자열이라고 가정)
      let requestData: Record<string, string>;
      try {
        requestData = JSON.parse(encryptedText);
      } catch (e) {
        // JSON이 아닌 경우 그냥 text 키로 전송
        requestData = { text: encryptedText };
      }

      // Record<string, string> 객체를 직접 전달합니다.
      const response = await adminSwaggerClient.reviewAnalyzeController.decrypt(requestData);

      setDecryptedText(response.data || '복호화 결과가 없습니다.');
    } catch (err) {
      console.error('복호화 오류:', err);
      setError('복호화 과정에서 오류가 발생했습니다.');
      setDecryptedText('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-black">복호화</h1>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <textarea
                className="w-full h-64 p-4 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                placeholder="복호화할 내용 입력..."
                value={encryptedText}
                onChange={(e) => setEncryptedText(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button 
                className="w-full py-3 bg-black text-white rounded-lg hover:bg-black/90 transition-colors disabled:bg-gray-400"
                onClick={handleDecrypt}
                disabled={isLoading}
              >
                {isLoading ? '복호화 중...' : '복호화'}
              </button>
            </div>
            <div className="h-64 p-4 border border-black rounded-lg bg-white overflow-auto">
              {decryptedText ? (
                <p className="text-black whitespace-pre-wrap">{decryptedText}</p>
              ) : (
                <p className="text-black">복호화된 결과가 여기에 표시됩니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Decrypt;