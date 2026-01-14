import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Deals from './pages/Deals';
import Reports from './pages/Report';
import Login from './pages/Login';
import PrivateRoute from './components/shared/PrivateRoute';
import Navigation from './components/shared/Navigation';
import SentimentAnalyzer from './components/SentimentAnalysis/SentimentAnalyzer';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Team from './pages/Team';
import Preferences from './pages/Preferences';
import { ThemeProvider } from './context/ThemeContext';
import Register from './pages/Register';

// Add this import at the top with your other page imports
import Taxation from './pages/Taxation';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/*" element={
                <PrivateRoute>
                  <>
                    <Navigation />
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/contacts" element={<Contacts />} />
                      <Route path="/deals" element={<Deals />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/team" element={<Team />} />
                      <Route path="/preferences" element={<Preferences />} />
                      <Route path="/sentiment" element={<SentimentAnalyzer />} />
                      {/* Route for the Taxation component */}
                      <Route path="/taxation" element={<Taxation />} />
                    </Routes>
                  </>
                </PrivateRoute>
              } />
            </Routes>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;