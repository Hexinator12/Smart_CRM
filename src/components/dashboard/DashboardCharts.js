import React, { useState, useEffect, useCallback } from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);

// Default empty chart data
const defaultChartData = {
  labels: [],
  datasets: [{
    label: 'No Data',
    data: [],
    backgroundColor: [],
    borderWidth: 1,
  }]
};

const DashboardCharts = () => {
  const [chartData, setChartData] = useState({
    pipelineData: defaultChartData,
    revenueData: defaultChartData,
    winLossData: defaultChartData,
    activityData: defaultChartData
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  
  // Move fetchChartData to useCallback to reuse it for refresh button
  const fetchChartData = useCallback(async (isMounted = true) => {
    try {
      setLoading(true);
      
      // Fetch deals for pipeline and win/loss charts
      const dealsSnapshot = await getDocs(collection(db, 'deals'));
      
      // Check if component is still mounted before updating state
      if (!isMounted) return;
      
      const deals = dealsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Prepare pipeline data (deals by stage)
      const stageLabels = ['New', 'Qualified', 'Proposition', 'Negotiation', 'Closed Won', 'Closed Lost'];
      const stageCounts = {
        'new': 0,
        'qualified': 0,
        'proposition': 0,
        'negotiation': 0,
        'closed-won': 0,
        'closed-lost': 0
      };
      
      // Prepare monthly revenue data
      const monthlyRevenue = {};
      const currentYear = new Date().getFullYear();
      
      // Prepare win/loss data
      let wonDeals = 0;
      let lostDeals = 0;
      
      deals.forEach(deal => {
        // Count deals by stage
        if (stageCounts.hasOwnProperty(deal.status)) {
          stageCounts[deal.status]++;
        }
        
        // Count won/lost deals
        if (deal.status === 'closed-won') {
          wonDeals++;
        } else if (deal.status === 'closed-lost') {
          lostDeals++;
        }
        
        // Group revenue by month (for closed-won deals)
        if (deal.status === 'closed-won' && deal.expectedCloseDate) {
          const closeDate = new Date(deal.expectedCloseDate);
          if (closeDate.getFullYear() === currentYear) {
            const month = closeDate.toLocaleString('default', { month: 'short' });
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(deal.value || 0);
          }
        }
      });
      
      // If no monthly revenue data, add a default month
      if (Object.keys(monthlyRevenue).length === 0) {
        monthlyRevenue['No Data'] = 0;
      }
      
      // Ensure we have activity data even if collection doesn't exist
      let activityTypes = { 'No Activities': 1 };
      
      try {
        // Fetch recent activities for timeline
        const activitiesSnapshot = await getDocs(
          query(collection(db, 'activities'), orderBy('timestamp', 'desc'))
        );
        
        const activities = activitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).slice(0, 10); // Get last 10 activities
        
        // Prepare activity data by type
        if (activities.length > 0) {
          activityTypes = {};
          activities.forEach(activity => {
            activityTypes[activity.type] = (activityTypes[activity.type] || 0) + 1;
          });
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        // Keep the default activity types
      }
      
      // Set all chart data
      if (isMounted) {
        setChartData({
          pipelineData: {
            labels: stageLabels,
            datasets: [
              {
                label: 'Deals by Stage',
                data: Object.values(stageCounts),
                backgroundColor: [
                  'rgba(54, 162, 235, 0.6)',
                  'rgba(75, 192, 192, 0.6)',
                  'rgba(255, 206, 86, 0.6)',
                  'rgba(153, 102, 255, 0.6)',
                  'rgba(75, 192, 92, 0.6)',
                  'rgba(255, 99, 132, 0.6)',
                ],
                borderWidth: 1,
              },
            ],
          },
          revenueData: {
            labels: Object.keys(monthlyRevenue),
            datasets: [
              {
                label: 'Monthly Revenue',
                data: Object.values(monthlyRevenue),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
              },
            ],
          },
          winLossData: {
            labels: ['Won Deals', 'Lost Deals'],
            datasets: [
              {
                label: 'Deal Outcomes',
                data: [wonDeals, lostDeals],
                backgroundColor: [
                  'rgba(75, 192, 92, 0.6)',
                  'rgba(255, 99, 132, 0.6)',
                ],
                borderWidth: 1,
              },
            ],
          },
          activityData: {
            labels: Object.keys(activityTypes),
            datasets: [
              {
                label: 'Recent Activities',
                data: Object.values(activityTypes),
                backgroundColor: [
                  'rgba(255, 99, 132, 0.6)',
                  'rgba(54, 162, 235, 0.6)',
                  'rgba(255, 206, 86, 0.6)',
                  'rgba(75, 192, 192, 0.6)',
                  'rgba(153, 102, 255, 0.6)',
                ],
                borderWidth: 1,
              },
            ],
          }
        });
        
        // Update last refreshed timestamp
        setLastRefreshed(new Date());
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      if (isMounted) {
        setError(error);
        // Set default data in case of error
        setChartData({
          pipelineData: {
            labels: ['No Data'],
            datasets: [{ label: 'No Data', data: [0], backgroundColor: ['rgba(200, 200, 200, 0.6)'] }]
          },
          revenueData: {
            labels: ['No Data'],
            datasets: [{ label: 'No Data', data: [0], borderColor: 'rgb(200, 200, 200)' }]
          },
          winLossData: {
            labels: ['No Data'],
            datasets: [{ label: 'No Data', data: [1], backgroundColor: ['rgba(200, 200, 200, 0.6)'] }]
          },
          activityData: {
            labels: ['No Data'],
            datasets: [{ label: 'No Data', data: [1], backgroundColor: ['rgba(200, 200, 200, 0.6)'] }]
          }
        });
        setLoading(false);
      }
    }
  }, []);
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchChartData(true);
  };
  
  useEffect(() => {
    let isMounted = true;
    fetchChartData(isMounted);
    
    return () => {
      isMounted = false;
    };
  }, [fetchChartData]);

  if (loading) {
    return <div className="text-center py-4">Loading charts...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error loading charts: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Dashboard Analytics</h2>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-3">
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </span>
          <button 
            onClick={handleRefresh} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {/* Sales Pipeline Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Sales Pipeline</h3>
          <div className="h-64">
            {chartData.pipelineData && chartData.pipelineData.labels && (
              <Bar 
                data={chartData.pipelineData} 
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Deals by Stage'
                    }
                  }
                }} 
              />
            )}
          </div>
        </div>
        
        {/* Monthly Revenue Trend */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
          <div className="h-64">
            {chartData.revenueData && chartData.revenueData.labels && (
              <Line 
                data={chartData.revenueData} 
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Revenue Trend'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Revenue ($)'
                      }
                    }
                  }
                }} 
              />
            )}
          </div>
        </div>
        
        {/* Deal Win/Loss Ratio */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Deal Win/Loss Ratio</h3>
          <div className="h-64">
            {chartData.winLossData && chartData.winLossData.labels && (
              <Pie 
                data={chartData.winLossData} 
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Deal Outcomes'
                    }
                  }
                }} 
              />
            )}
          </div>
        </div>
        
        {/* Activity Distribution */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Activity Distribution</h3>
          <div className="h-64">
            {chartData.activityData && chartData.activityData.labels && (
              <Doughnut 
                data={chartData.activityData} 
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Recent Activities by Type'
                    }
                  }
                }} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;