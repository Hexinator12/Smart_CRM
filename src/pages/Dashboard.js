import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import { useNavigate } from 'react-router-dom'; // Add this import

function Dashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalDeals: 0,
    activeDeals: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Now this will work correctly

  useEffect(() => {
    let isMounted = true;
    
    const fetchDashboardStats = async () => {
      try {
        // Fetch contacts count
        const contactsSnapshot = await getDocs(collection(db, 'contacts'));
        if (!isMounted) return;
        
        const contactsCount = contactsSnapshot.size;

        // Fetch deals
        const dealsSnapshot = await getDocs(collection(db, 'deals'));
        if (!isMounted) return;
        
        const dealsCount = dealsSnapshot.size;
        let activeDealsCount = 0;
        let totalValue = 0;

        // Define active deal statuses
        const activeStatuses = ['new', 'qualified', 'proposition', 'negotiation'];

        dealsSnapshot.forEach(doc => {
          const deal = doc.data();
          if (activeStatuses.includes(deal.status)) {
            activeDealsCount++;
          }
          totalValue += Number(deal.value || 0);
        });

        if (isMounted) {
          setStats({
            totalContacts: contactsCount,
            totalDeals: dealsCount,
            activeDeals: activeDealsCount,
            totalValue: totalValue
          });
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        if (isMounted) {
          setError(error);
          setLoading(false);
        }
      }
    };

    fetchDashboardStats();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Add quick action handlers
  const handleQuickAction = (path) => {
    navigate(path);
  };

  // Add a key to the DashboardCharts component to force re-render when navigating
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-3xl font-bold">Welcome, {currentUser?.displayName || currentUser?.email}</h1>
        <p className="text-gray-600 mt-2">Here's an overview of your CRM data</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Contacts Card */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Contacts</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalContacts}</p>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <span>↗</span>
            <span className="ml-1">4% from last month</span>
          </div>
        </div>

        {/* Total Deals Card */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Deals</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalDeals}</p>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <span>↗</span>
            <span className="ml-1">2% from last month</span>
          </div>
        </div>

        {/* Active Deals Card */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-gray-500 text-sm font-medium">Active Deals</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.activeDeals}</p>
          <div className="mt-2 flex items-center text-sm text-yellow-600">
            <span>→</span>
            <span className="ml-1">Same as last month</span>
          </div>
        </div>

        {/* Total Value Card */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Value</h3>
          <p className="text-3xl font-bold text-gray-900">${stats.totalValue.toLocaleString()}</p>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <span>↗</span>
            <span className="ml-1">12% from last month</span>
          </div>
        </div>
      </div>

      {/* Data Visualization Charts */}
      <div className="mt-8">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-red-500">Error loading dashboard: {error.message}</p>
          </div>
        ) : (
          <DashboardCharts key={`dashboard-charts-${Date.now()}`} />
        )}
      </div>
      
      {/* Quick Actions Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => handleQuickAction('/contacts')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg shadow flex items-center justify-center space-x-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Add New Contact</span>
          </button>
          
          <button 
            onClick={() => handleQuickAction('/deals')}
            className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg shadow flex items-center justify-center space-x-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Create New Deal</span>
          </button>
          
          <button 
            onClick={() => handleQuickAction('/tasks')}
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg shadow flex items-center justify-center space-x-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>Add New Task</span>
          </button>
          
          <button 
            onClick={() => handleQuickAction('/calendar')}
            className="bg-yellow-600 hover:bg-yellow-700 text-white p-4 rounded-lg shadow flex items-center justify-center space-x-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>View Calendar</span>
          </button>
          
          <button 
            onClick={() => handleQuickAction('/reports')}
            className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg shadow flex items-center justify-center space-x-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>View Reports</span>
          </button>
          
          <button 
            onClick={() => handleQuickAction('/taxation')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-lg shadow flex items-center justify-center space-x-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Taxation</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;