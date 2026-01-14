import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';

function Calendar() {
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const tasksQuery = query(collection(db, 'tasks'));
      const dealsQuery = query(collection(db, 'deals'));
      
      const [tasksSnap, dealsSnap] = await Promise.all([
        getDocs(tasksQuery),
        getDocs(dealsQuery)
      ]);

      const taskEvents = tasksSnap.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        date: doc.data().dueDate,
        type: 'task'
      }));

      const dealEvents = dealsSnap.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        date: doc.data().expectedCloseDate,
        type: 'deal'
      }));

      setEvents([...taskEvents, ...dealEvents]);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Calendar</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Previous
          </button>
          <h2 className="text-xl font-semibold">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Next
          </button>
        </div>
        <div className="space-y-4">
          {events.map(event => (
            <div 
              key={event.id} 
              className={`p-4 rounded-lg flex justify-between items-center ${
                event.type === 'task' ? 'bg-blue-50' : 'bg-green-50'
              }`}
            >
              <div>
                <p className="font-semibold text-lg">{event.title}</p>
                <p className="text-sm text-gray-600">{event.date}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                event.type === 'task' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Calendar;