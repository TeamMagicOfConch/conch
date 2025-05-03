import { useState } from 'react';
import Layout from '../components/Layout';

const Download = () => {
  const [startYear, setStartYear] = useState('2025');
  const [startMonth, setStartMonth] = useState('01');
  const [startDay, setStartDay] = useState('01');
  const [endYear, setEndYear] = useState('2025');
  const [endMonth, setEndMonth] = useState('01');
  const [endDay, setEndDay] = useState('01');

  const years = ['2025', '2024', '2023'];
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black">Start Date</label>
                <div className="flex gap-2">
                  <select
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                    className="px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <select
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value)}
                    className="px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  <select
                    value={startDay}
                    onChange={(e) => setStartDay(e.target.value)}
                    className="px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black">End Date</label>
                <div className="flex gap-2">
                  <select
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    className="px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <select
                    value={endMonth}
                    onChange={(e) => setEndMonth(e.target.value)}
                    className="px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  <select
                    value={endDay}
                    onChange={(e) => setEndDay(e.target.value)}
                    className="px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button className="px-8 py-2.5 bg-black text-white rounded-lg hover:bg-black/90 transition-colors mt-8">
                Get File
              </button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-black font-medium">CSV File.csv</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Download;