import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function Reports() {
  const [reportData, setReportData] = useState({
    dealsByStatus: {},
    totalDealsValue: 0,
    monthlyDeals: {},
    topCompanies: [],
    conversionRate: 0
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      // Fetch deals
      const dealsSnapshot = await getDocs(collection(db, 'deals'));
      const deals = dealsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Process deals by status
      const dealsByStatus = deals.reduce((acc, deal) => {
        acc[deal.status] = (acc[deal.status] || 0) + 1;
        return acc;
      }, {});

      // Calculate total deals value
      const totalDealsValue = deals.reduce((sum, deal) => sum + Number(deal.value || 0), 0);

      // Process monthly deals
      const monthlyDeals = deals.reduce((acc, deal) => {
        const month = new Date(deal.expectedCloseDate).toLocaleString('default', { month: 'long' });
        acc[month] = (acc[month] || 0) + Number(deal.value || 0);
        return acc;
      }, {});

      // Calculate top companies
      const companiesData = deals.reduce((acc, deal) => {
        if (!acc[deal.company]) {
          acc[deal.company] = { totalValue: 0, dealsCount: 0 };
        }
        acc[deal.company].totalValue += Number(deal.value || 0);
        acc[deal.company].dealsCount += 1;
        return acc;
      }, {});

      const topCompanies = Object.entries(companiesData)
        .map(([company, data]) => ({
          company,
          ...data
        }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 5);

      // Calculate conversion rate
      const closedDeals = deals.filter(deal => deal.status === 'closed-won').length;
      const conversionRate = deals.length > 0 ? (closedDeals / deals.length) * 100 : 0;

      setReportData({
        dealsByStatus,
        totalDealsValue,
        monthlyDeals,
        topCompanies,
        conversionRate
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Reports & Analytics</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Pipeline Value</h3>
          <p className="text-3xl font-bold text-gray-900">
            ${reportData.totalDealsValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Conversion Rate</h3>
          <p className="text-3xl font-bold text-gray-900">
            {reportData.conversionRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Deals by Status */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Deals by Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(reportData.dealsByStatus).map(([status, count]) => (
            <div key={status} className="text-center">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-gray-500 capitalize">{status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Companies */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Top Companies</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Company</th>
                <th className="text-right py-2">Total Value</th>
                <th className="text-right py-2">Deals Count</th>
              </tr>
            </thead>
            <tbody>
              {reportData.topCompanies.map((company) => (
                <tr key={company.company} className="border-b">
                  <td className="py-2">{company.company}</td>
                  <td className="text-right">${company.totalValue.toLocaleString()}</td>
                  <td className="text-right">{company.dealsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Deals */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Monthly Deals Value</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(reportData.monthlyDeals).map(([month, value]) => (
            <div key={month} className="text-center">
              <div className="text-2xl font-bold">${value.toLocaleString()}</div>
              <div className="text-gray-500">{month}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Reports;