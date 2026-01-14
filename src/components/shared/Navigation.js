import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

function Navigation() {
  const { currentUser, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className={`${darkMode ? 'bg-gray-900' : 'bg-gray-800'} text-white p-4 transition-colors duration-200`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/contacts">Contacts</Link>
          <Link to="/deals">Deals</Link>
          <Link to="/reports">Reports</Link>
          <Link to="/tasks">Tasks</Link>
          <Link to="/calendar">Calendar</Link>
          <Link to="/taxation">Taxation</Link>
          <div className="relative">
            <button 
              className="hover:text-gray-300 focus:outline-none"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              onBlur={() => setTimeout(() => setIsSettingsOpen(false), 200)}
            >
              Settings
            </button>
            {isSettingsOpen && (
              <div className={`absolute left-0 w-48 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg rounded-md mt-2 py-2 z-50`}>
                <Link 
                  to="/profile" 
                  className={`block px-4 py-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  onClick={() => setIsSettingsOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/preferences" 
                  className={`block px-4 py-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  onClick={() => setIsSettingsOpen(false)}
                >
                  Preferences
                </Link>
                <Link 
                  to="/team" 
                  className={`block px-4 py-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  onClick={() => setIsSettingsOpen(false)}
                >
                  Team Management
                </Link>
                <Link 
                  to="/sentiment" 
                  className={`block px-4 py-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} text-blue-500 font-medium`}
                  onClick={() => setIsSettingsOpen(false)}
                >
                  Analyze Sentiment
                </Link>
                <button
                  className={`w-full text-left px-4 py-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  onClick={() => {
                    toggleDarkMode();
                    setIsSettingsOpen(false);
                  }}
                >
                  {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span>{currentUser?.email}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;