import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
// Chart.js imports
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Taxation() {
  const [taxRecords, setTaxRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaxRecord, setNewTaxRecord] = useState({
    clientName: '',
    gstNumber: '',
    panNumber: '',
    taxType: 'GST',
    amount: '',
    taxRate: '',
    taxAmount: '',
    dueDate: '',
    status: 'pending'
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  // Initialize chart data state
  const [chartData, setChartData] = useState({
    taxTypeData: { labels: [], datasets: [] },
    statusData: { labels: [], datasets: [] },
    monthlyData: { labels: [], datasets: [] }
  });

  // Define prepareChartData first
  const prepareChartData = useCallback((records) => {
    // Tax Type Distribution
    const taxTypes = {};
    const statusCounts = { 'paid': 0, 'pending': 0, 'overdue': 0 };
    const monthlyAmounts = {};
    
    records.forEach(record => {
      // Count tax types
      taxTypes[record.taxType] = (taxTypes[record.taxType] || 0) + parseFloat(record.amount);
      
      // Count statuses
      statusCounts[record.status] = (statusCounts[record.status] || 0) + 1;
      
      // Group by month
      const month = new Date(record.dueDate).toLocaleString('default', { month: 'short' });
      monthlyAmounts[month] = (monthlyAmounts[month] || 0) + parseFloat(record.amount);
    });
    
    setChartData({
      taxTypeData: {
        labels: Object.keys(taxTypes),
        datasets: [{
          label: 'Tax Amount by Type',
          data: Object.values(taxTypes),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
          ],
          borderWidth: 1,
        }],
      },
      statusData: {
        labels: Object.keys(statusCounts),
        datasets: [{
          label: 'Tax Records by Status',
          data: Object.values(statusCounts),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          borderWidth: 1,
        }],
      },
      monthlyData: {
        labels: Object.keys(monthlyAmounts),
        datasets: [{
          label: 'Monthly Tax Amount',
          data: Object.values(monthlyAmounts),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }],
      }
    });
  }, []);

  // Then define fetchTaxRecords which uses prepareChartData
  const fetchTaxRecords = useCallback(async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'taxRecords'));
      const records = [];
      querySnapshot.forEach((doc) => {
        records.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setTaxRecords(records);
      prepareChartData(records);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tax records:', error);
      setLoading(false);
    }
  }, [prepareChartData]);

  useEffect(() => {
    fetchTaxRecords();
  }, [fetchTaxRecords]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTaxRecord({
      ...newTaxRecord,
      [name]: value
    });

    // Auto-calculate tax amount when amount or tax rate changes
    if (name === 'amount' || name === 'taxRate') {
      const amount = name === 'amount' ? parseFloat(value) : parseFloat(newTaxRecord.amount);
      const taxRate = name === 'taxRate' ? parseFloat(value) : parseFloat(newTaxRecord.taxRate);
      
      if (!isNaN(amount) && !isNaN(taxRate)) {
        const taxAmount = (amount * taxRate / 100).toFixed(2);
        setNewTaxRecord(prev => ({
          ...prev,
          taxAmount: taxAmount
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'taxRecords'), newTaxRecord);
      setNewTaxRecord({
        clientName: '',
        gstNumber: '',
        panNumber: '',
        taxType: 'GST',
        amount: '',
        taxRate: '',
        taxAmount: '',
        dueDate: '',
        status: 'pending'
      });
      setIsFormVisible(false);
      fetchTaxRecords();
    } catch (error) {
      console.error('Error adding tax record:', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'taxRecords', id), {
        status: newStatus
      });
      fetchTaxRecords();
    } catch (error) {
      console.error('Error updating tax record status:', error);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm('Are you sure you want to delete this tax record?')) {
      try {
        await deleteDoc(doc(db, 'taxRecords', id));
        fetchTaxRecords();
      } catch (error) {
        console.error('Error deleting tax record:', error);
      }
    }
  };

  // Remove this duplicate declaration and its implementation
  // const prepareChartData = useCallback((records) => {
  //   ...
  // }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Indian Taxation Management</h1>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setIsFormVisible(!isFormVisible)}
        >
          {isFormVisible ? 'Cancel' : 'Add New Tax Record'}
        </button>
      </div>

      {/* Add Tax Dashboard with Charts */}
      {!loading && taxRecords.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Tax Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Tax Distribution by Type</h3>
              <div className="h-64">
                <Pie data={chartData.taxTypeData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Tax Records by Status</h3>
              <div className="h-64">
                <Pie data={chartData.statusData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Monthly Tax Amount</h3>
              <div className="h-64">
                <Bar 
                  data={chartData.monthlyData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Amount (₹)'
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {isFormVisible && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Tax Record</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Client Name</label>
                <input
                  type="text"
                  name="clientName"
                  value={newTaxRecord.clientName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={newTaxRecord.gstNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">PAN Number</label>
                <input
                  type="text"
                  name="panNumber"
                  value={newTaxRecord.panNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="AAAAA0000A"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Tax Type</label>
                <select
                  name="taxType"
                  value={newTaxRecord.taxType}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="GST">GST</option>
                  <option value="TDS">TDS</option>
                  <option value="Income Tax">Income Tax</option>
                  <option value="Professional Tax">Professional Tax</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={newTaxRecord.amount}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  name="taxRate"
                  value={newTaxRecord.taxRate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Tax Amount (₹)</label>
                <input
                  type="number"
                  name="taxAmount"
                  value={newTaxRecord.taxAmount}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={newTaxRecord.dueDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save Tax Record
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-center py-4">Loading tax records...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {taxRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No tax records found</td>
                </tr>
              ) : (
                taxRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.clientName}</div>
                      <div className="text-sm text-gray-500">GST: {record.gstNumber}</div>
                      <div className="text-sm text-gray-500">PAN: {record.panNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.taxType}</div>
                      <div className="text-sm text-gray-500">Rate: {record.taxRate}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{parseFloat(record.amount).toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Tax: ₹{parseFloat(record.taxAmount).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${record.status === 'paid' ? 'bg-green-100 text-green-800' : 
                          record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center">
                        <select 
                          className="p-1 border rounded text-sm min-w-[90px]"
                          value={record.status}
                          onChange={(e) => handleStatusChange(record.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                        </select>
                        <button 
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-600 hover:text-red-900 ml-4"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Taxation;