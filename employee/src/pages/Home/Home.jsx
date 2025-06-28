import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {FaUser, FaClock, FaSignInAlt, FaSignOutAlt,FaPause, FaPlay, FaHistory, FaEllipsisH //podhum da 
} from 'react-icons/fa';
import { IoMdCheckmarkCircle, IoMdCloseCircle } from 'react-icons/io';
import './Home.css';
import Header from '../../components/Header';

const Home = () => {
 

  const [isActive, setIsActive] = useState(true);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
const currentDate = new Date();
const [checkInTime, setCheckInTime] = useState(
  `${currentDate.getHours()}:${currentDate.getMinutes().toString().padStart(2, '0')}`
);

  const [checkOutTime, setCheckOutTime] = useState('__:__ ');
  const [breakStartTime, setBreakStartTime] = useState('01:00 PM');
  const [breakEndTime, setBreakEndTime] = useState('01:30 PM');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBreakHistory, setShowBreakHistory] = useState(true);
  const [breakHistory, setBreakHistory] = useState([]);
  const [greeting, setGreeting] = useState("");

  const token = localStorage.getItem('token');
  const employeeId = localStorage.getItem('id') || 'nil';
  const userName = localStorage.getItem('name') || 'Guest';
  const Role = localStorage.getItem('role');

  useEffect(() => {
    const newStatus = !(isOnBreak || isCheckedOut);
    setIsActive(newStatus);//haaaaaaa stsus 
    updateEmployeeStatus(newStatus ? 'Active' : 'Inactive');
  }, [isOnBreak, isCheckedOut]);

  useEffect(() => {
    fetchBreakHistory();
  }, []);
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 17) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

  const fetchBreakHistory = async () => {
    try {
      const response = await axios.get(
        `https://sales-backend-mern-production.up.railway.app/api/activities?employeeId=${employeeId}&activity=Break`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const processedBreaks = processBreakData(response.data);
      setBreakHistory(processedBreaks);
    } catch (err) {
      console.error('Error fetching break history:', err);
    }
  };

  const processBreakData = (activities) => {
    const breaks = [];
    let currentBreak = null;

    activities.forEach(activity => {
      if (activity.activity_string.includes('started a break')) {
        currentBreak = {
          start: new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          startDate: new Date(activity.createdAt).toLocaleDateString(),
          end: null,
          duration: null
        };
      } else if (activity.activity_string.includes('ended a break') && currentBreak) {
        currentBreak.end = new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        currentBreak.duration = calculateBreakDuration(currentBreak.start, currentBreak.end);
        breaks.push(currentBreak);
        currentBreak = null;
      }
    });

    if (currentBreak) {
      breaks.push(currentBreak);
    }

    return breaks.reverse().slice(0, 20);
  };

  const updateEmployeeStatus = async (status) => {
    setIsLoading(true);
    try {
      await axios.patch(
        `https://sales-backend-mern-production.up.railway.app/api/employees/${employeeId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setError(null);
    } catch (err) {
      console.error('Error updating employee status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logActivity = async (activity_string, activity) => {
    try {
      await axios.post(
        'https://sales-backend-mern-production.up.railway.app/api/activities/add',
        { activity_string, activity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBreakHistory();
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  const toggleBreakStatus = async () => {
    const newBreakStatus = !isOnBreak;
    setIsOnBreak(newBreakStatus);

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (newBreakStatus) {
      setBreakStartTime(time);
      await logActivity(`${userName} started a break`, ['Started Break']);
    } else {
      setBreakEndTime(time);
      await logActivity(`${userName} ended a break`, ['Ended Break']);
    }
  };

  const toggleBreakHistory = async () => {
    const newShowBreakHistory = showBreakHistory;
    setShowBreakHistory(newShowBreakHistory);
    if (newShowBreakHistory) {
      await logActivity(`${userName} viewed break history`, ['Viewed Break History']);
    }
  };

  const handleCheckIn = async () => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setIsCheckedOut(false);
    setCheckInTime(time);
    await updateEmployeeStatus('Active');
    await logActivity(`${userName} checked in`, ['Checked In']);
  };

  const handleCheckOut = async () => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setIsCheckedOut(true);
    setCheckOutTime(time);
    await updateEmployeeStatus('Inactive');
    await logActivity(`${userName} checked out`, ['Checked Out']);
  };

  return (
    <div className="app-container">
   <Header/>


      <main className="content">
        {error && <div className="error-message">{error}</div>}

<section className="section timing-section">
  <h2 className="section-title">
    <FaClock className="section-icon" /> Timings
  </h2>

  <div className="unified-timing-card">
    <div className="timing-info">
      <div className="timing-block">
        <div className="timing-label">Checked-In</div>
        <div className="timing-value">{checkInTime}</div>
        {isCheckedOut && (
          <button className="checkin-btn hidden-btn" onClick={handleCheckIn} disabled={isLoading}>
            Check In
          </button>
        )}
      </div>
      <div className="timing-block">
        <div className="timing-label">Check Out</div>
        <div className="timing-value">{checkOutTime || "--:-- __"}</div>
        {!isCheckedOut && (
          <button className="checkout-btn hidden-btn" onClick={handleCheckOut} disabled={isLoading}>
            Check Out
          </button>
        )}
      </div>
    </div>

    <div
      className="status-indicator pill-indicator"
      onClick={() => {
        isActive ? handleCheckOut() : handleCheckIn();
      }}
    >
      <div className={`status-toggle ${isActive ? 'active' : 'inactive'}`}>
        {isActive ? (
          <IoMdCheckmarkCircle className="status-icon" />
        ) : (
          <IoMdCloseCircle className="status-icon" />
        )}
      </div>
    </div>
  </div>
</section>




        <section className="section break-section">
          <div className="section-header">
            <h2 className="section-title">
              Break Time
            </h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              
              <button
                className="history-toggle-btn"
                onClick={toggleBreakStatus}
                style={{ backgroundColor: isOnBreak ? '#dc3545' : '#28a745', color: 'white' }}
              >
                {isOnBreak ? '' : ''}
              </button>
            </div>
          </div>

          {!showBreakHistory ? "" : (
            <div className="break-history-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {breakHistory.length > 0 ? (
                    breakHistory.map((breakItem, index) => (
                      <tr key={index}>
                        <td>{breakItem.startDate}</td>
                        <td>{breakItem.start}</td>
                        <td>{breakItem.end || 'In Progress'}</td>
                        <td>{breakItem.duration || '-'} {breakItem.duration ? 'mins' : ''}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-breaks">No break history available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="section activity-section">
          <div className="section-header">
            <h2 className="section-title">
              <FaHistory className="section-icon" /> Recent Activity
            </h2>
            <button className="view-all-btn">
              <FaEllipsisH />
            </button>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-bullet success"></div>
              <div className="activity-content">
                <p className="activity-text">{userName} checked in at {checkInTime}</p>
                <p className="activity-time">Today</p>
              </div>
            </div>
            {isOnBreak && (
              <div className="activity-item">
                <div className="activity-bullet warning"></div>
                <div className="activity-content">
                  <p className="activity-text">{userName} started a break at {breakStartTime}</p>
                  <p className="activity-time">Today</p>
                </div>
              </div>
            )}
            {!isOnBreak && breakEndTime !== '01:30 PM' && (
              <div className="activity-item">
                <div className="activity-bullet info"></div>
                <div className="activity-content">
                  <p className="activity-text">{userName} ended a break at {breakEndTime}</p>
                  <p className="activity-time">Today</p>
                </div>
              </div>
            )}
            {isCheckedOut && (
              <div className="activity-item">
                <div className="activity-bullet primary"></div>
                <div className="activity-content">
                  <p className="activity-text">{userName} checked out at {checkOutTime}</p>
                  <p className="activity-time">Today</p>
                </div>
              </div>
            )}
            {showBreakHistory && (
              <div className="activity-item">
                <div className="activity-bullet secondary"></div>
                <div className="activity-content">
                  <p className="activity-text">{userName} viewed break history</p>
                  <p className="activity-time">Just now</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

function calculateBreakDuration(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const startHour = parseInt(startTime.split(':')[0]);
  const startMin = parseInt(startTime.split(' ')[0].split(':')[1]);
  const endHour = parseInt(endTime.split(':')[0]);
  const endMin = parseInt(endTime.split(' ')[0].split(':')[1]);
  return (endHour - startHour) * 60 + (endMin - startMin);
}

export default Home;
