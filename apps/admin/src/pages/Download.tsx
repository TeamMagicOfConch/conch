import { useState } from 'react'
import { adminSwaggerClient } from '../lib/api'
import Layout from '../components/Layout'

function Download() {
  const [startYear, setStartYear] = useState('2025')
  const [startMonth, setStartMonth] = useState('01')
  const [startDay, setStartDay] = useState('01')
  const [endYear, setEndYear] = useState('2025')
  const [endMonth, setEndMonth] = useState('01')
  const [endDay, setEndDay] = useState('01')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [fileName, setFileName] = useState('')

  const years = ['2025', '2024', '2023']
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))

  const handleDownload = async () => {
    const startDate = `${startYear}-${startMonth}-${startDay}`
    const endDate = `${endYear}-${endMonth}-${endDay}`

    // 날짜 유효성 검사
    if (new Date(startDate) > new Date(endDate)) {
      setError('시작일은 종료일보다 이전이어야 합니다.')
      return
    }

    setIsLoading(true)
    setError('')
    setFileName('')
    setDownloadUrl('')

    try {
      // startDate와 endDate를 직접 전달하고, Axios의 responseType을 'arraybuffer'로 설정
      const response = await adminSwaggerClient.reviewAnalyzeController.exportReviewCsv({
        startDate,
        endDate,
      })

      // 서버 응답으로부터 파일 생성
      const blob = new Blob([response.data as any], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      setDownloadUrl(url)

      // 파일명 생성 (현재 날짜 기준)
      const date = new Date()
      const fileNameGenerated = `review_data_${startDate}_to_${endDate}_${date.getTime()}.csv`
      setFileName(fileNameGenerated)

      // 자동 다운로드 (선택적)
      const a = document.createElement('a')
      a.href = url
      a.download = fileNameGenerated
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (err) {
      console.error('다운로드 오류:', err)
      setError('CSV 파일 다운로드 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-black">데이터 다운로드</h1>
            <div className="flex items-center gap-8">
              <div className="space-y-2">
                <div className="block text-sm font-medium text-black">
                  Start Date
                </div>
                <div className="flex gap-2">
                  <select
                    id="startYear"
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                    className="px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {years.map((year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    ))}
                  </select>
                  <select
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value)}
                    className="px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {months.map((month) => (
                      <option
                        key={month}
                        value={month}
                      >
                        {month}
                      </option>
                    ))}
                  </select>
                  <select
                    value={startDay}
                    onChange={(e) => setStartDay(e.target.value)}
                    className="px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {days.map((day) => (
                      <option
                        key={day}
                        value={day}
                      >
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <div className="block text-sm font-medium text-black">End Date</div>
                <div className="flex gap-2">
                  <select
                    id="endYear"
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    className="px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {years.map((year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    ))}
                  </select>
                  <select
                    value={endMonth}
                    onChange={(e) => setEndMonth(e.target.value)}
                    className="px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {months.map((month) => (
                      <option
                        key={month}
                        value={month}
                      >
                        {month}
                      </option>
                    ))}
                  </select>
                  <select
                    value={endDay}
                    onChange={(e) => setEndDay(e.target.value)}
                    className="px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {days.map((day) => (
                      <option
                        key={day}
                        value={day}
                      >
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                className="px-8 py-2.5 bg-black text-white rounded-lg hover:bg-black/90 transition-colors mt-8 disabled:bg-gray-400"
                onClick={handleDownload}
                disabled={isLoading}
              >
                {isLoading ? '파일 가져오는 중...' : 'Get File'}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {fileName && downloadUrl && (
              <div className="mt-4">
                <a
                  href={downloadUrl}
                  download={fileName}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  {fileName} 다운로드
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Download
