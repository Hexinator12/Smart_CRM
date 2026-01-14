import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

function Deals() {
  const [deals, setDeals] = useState([]);
  const [newDeal, setNewDeal] = useState({
    title: '',
    value: '',
    status: 'new',
    company: '',
    contactPerson: '',
    expectedCloseDate: ''
  });
  const [editingDeal, setEditingDeal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const statusOptions = ['new', 'qualified', 'proposition', 'negotiation', 'closed-won', 'closed-lost'];

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'deals'));
      const dealsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDeals(dealsList);
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDeal) {
        await updateDoc(doc(db, 'deals', editingDeal.id), newDeal);
      } else {
        await addDoc(collection(db, 'deals'), newDeal);
      }
      setNewDeal({
        title: '',
        value: '',
        status: 'new',
        company: '',
        contactPerson: '',
        expectedCloseDate: ''
      });
      setEditingDeal(null);
      setIsModalOpen(false);
      fetchDeals();
    } catch (error) {
      console.error('Error saving deal:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await deleteDoc(doc(db, 'deals', id));
        fetchDeals();
      } catch (error) {
        console.error('Error deleting deal:', error);
      }
    }
  };

  const handleEdit = (deal) => {
    setNewDeal(deal);
    setEditingDeal(deal);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'qualified': 'bg-purple-100 text-purple-800',
      'proposition': 'bg-yellow-100 text-yellow-800',
      'negotiation': 'bg-orange-100 text-orange-800',
      'closed-won': 'bg-green-100 text-green-800',
      'closed-lost': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Deals</h1>
        <div className="flex space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-4 py-2"
          >
            <option value="all">All Deals</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Deal
          </button>
        </div>
      </div>

      {/* Update the deals mapping to filter by status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deals
          .filter(deal => statusFilter === 'all' || deal.status === statusFilter)
          .map(deal => (
            <div key={deal.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{deal.title}</h3>
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(deal.status)}`}>
                  {deal.status}
                </span>
              </div>
              <p className="text-2xl font-bold text-green-600 my-2">${Number(deal.value).toLocaleString()}</p>
              <p className="text-gray-600">{deal.company}</p>
              <p className="text-gray-600">{deal.contactPerson}</p>
              <p className="text-gray-600">Close Date: {deal.expectedCloseDate}</p>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleEdit(deal)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(deal.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Add/Edit Deal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingDeal ? 'Edit Deal' : 'Add New Deal'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Deal Title"
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({...newDeal, title: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="number"
                  placeholder="Deal Value"
                  value={newDeal.value}
                  onChange={(e) => setNewDeal({...newDeal, value: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
                <select
                  value={newDeal.status}
                  onChange={(e) => setNewDeal({...newDeal, status: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Company"
                  value={newDeal.company}
                  onChange={(e) => setNewDeal({...newDeal, company: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Contact Person"
                  value={newDeal.contactPerson}
                  onChange={(e) => setNewDeal({...newDeal, contactPerson: e.target.value})}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="date"
                  placeholder="Expected Close Date"
                  value={newDeal.expectedCloseDate}
                  onChange={(e) => setNewDeal({...newDeal, expectedCloseDate: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {editingDeal ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewDeal({
                      title: '',
                      value: '',
                      status: 'new',
                      company: '',
                      contactPerson: '',
                      expectedCloseDate: ''
                    });
                    setEditingDeal(null);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Deals;