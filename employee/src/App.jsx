import { BrowserRouter as Router, Routes, Route,Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home/Home';
import Leads from './pages/leads_page/Leads';
import Tasks from './pages/Tasks/Tasks';
import Profile from './pages/Profile/Profile';
import Login from './pages/Login/Login';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
 
          <Route path="/login" element={<Login />} />
          
      
          <Route element={<PrivateRoute />}>
            <Route path="/" element={
              <>
                <Navbar />
                <Home />
              </>
            } />
            <Route path="/home" element={
              <>
                <Navbar />
                <Home />
              </>
            } />
            <Route path="/leads" element={
              <>
                <Navbar />
                <Leads />
              </>
            } />
            <Route path="/tasks" element={
              <>
                <Navbar />
                <Tasks />
              </>
            } />
            <Route path="/profile" element={
              <>
                <Navbar />
                <Profile />
              </>
            } />
          </Route>
          
          {/* royteeeeeeee*/}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;