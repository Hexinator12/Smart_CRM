import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';

function Preferences() {
  const { currentUser } = useAuth();
  const { darkMode } = useTheme();
  const [preferences, setPreferences] = useState({
    theme: 'light',
    notifications: true,
    emailUpdates: true,
    language: 'en'
  });

  useEffect(() => {
    // Load user preferences when component mounts
    const loadPreferences = async () => {
      try {
        const prefsDoc = await getDoc(doc(db, 'userPreferences', currentUser.uid));
        if (prefsDoc.exists()) {
          setPreferences(prefsDoc.data());
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadPreferences();
  }, [currentUser.uid]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create the preferences document if it doesn't exist
      const userPrefsRef = doc(db, 'userPreferences', currentUser.uid);
      await setDoc(userPrefsRef, {
        ...preferences,
        updatedAt: new Date().toISOString(),
        userId: currentUser.uid
      }, { merge: true });
      
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert(`Failed to save preferences: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Preferences
      </h1>
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow p-6`}>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className={`block mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Theme
              </label>
              <select
                name="theme"
                value={preferences.theme}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div>
              <label className={`flex items-center space-x-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <input
                  type="checkbox"
                  name="notifications"
                  checked={preferences.notifications}
                  onChange={handleChange}
                  className={`rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
                <span>Enable Notifications</span>
              </label>
            </div>

            {/* Apply similar dark mode classes to other form elements */}

            <button
              type="submit"
              className={`px-4 py-2 rounded ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Preferences;