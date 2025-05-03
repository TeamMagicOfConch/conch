import Layout from '../components/Layout';

const Decrypt = () => {
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
              />
              <button className="w-full py-3 bg-black text-white rounded-lg hover:bg-black/90 transition-colors">
                복호화
              </button>
            </div>
            <div className="h-64 p-4 border border-black rounded-lg bg-white">
              <p className="text-black">복호화된 결과가 여기에 표시됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Decrypt;