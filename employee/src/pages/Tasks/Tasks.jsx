import React, { useState, useEffect } from "react";
import "./Tasks.css";
import { 
  FiSearch, 
  FiFilter, 
  FiPhone, 
  FiChevronRight,
  FiCalendar,
  FiClock,
  FiUser,
  FiX,
  FiArrowLeft
} from "react-icons/fi";
import { IoCallOutline } from "react-icons/io5";
import axios from 'axios';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://sales-backend-mern-production.up.railway.app/api/leads', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Transform employee data into task format
        const transformedTasks = response.data.map((employee, index) => ({
          _id: employee._id,
          type: index % 3 === 0 ? 'Referral' : index % 3 === 1 ? 'Follow-up' : 'Cold call',
          phone: employee.phone || 'No phone',
          date: new Date(Date.now() + (index * 86400000)).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }),
          time: `${9 + (index % 8)}:${index % 2 === 0 ? '00' : '30'} ${index % 2 === 0 ? 'AM' : 'PM'}`,
          method: 'Call',
          person: employee.name,
          priority: index % 4 === 0 ? 'high' : 'normal',
          avatarColor: getAvatarColor(employee.name)
        }));
        
        setTasks(transformedTasks.reverse()); // Show newest first
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again.');
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const getAvatarColor = (name) => {
    const colors = ['#FF9F43', '#7367F0', '#28C76F', '#EA5455', '#00CFE8'];
    const charCode = name?.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  const filteredTasks = tasks.filter(task =>
    task.person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.phone?.includes(searchTerm) ||
    task.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.method?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="tasks-app">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tasks-app">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-app">
      <div className="header">
        <div className="header-content">
          <button className="back-button" onClick={() => window.history.back()}>
            <FiArrowLeft />
          </button>
          <div className="header-title">
            <h1>Tasks</h1>
          </div>
          <div style={{ width: '40px' }}></div>
        </div>
      </div>
      <main className="tasks-content">
        <div className="tasks-controls">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <FiX 
                className="clear-icon" 
                onClick={() => setSearchTerm('')} 
              />
            )}
          </div>
          <button className="filter-button">
            <FiFilter className="filter-icon" />
          </button>
        </div>

        <div className="tasks-list">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`task-card ${task.priority === 'high' ? "highlighted" : ""}`}
              >
                <div className="task-header">
                  <span className={`task-type ${task.type?.toLowerCase().replace(' ', '-')}`}>
                    {task.type || 'Task'}
                  </span>
                  <div className="task-date-time">
                    <span className="task-date">
                      <FiCalendar /> {task.date}
                    </span>
                    <span className="task-time">
                      <FiClock /> {task.time}
                    </span>
                  </div>
                </div>
                
                <div className="task-main">
                  <div className="task-phone-container">
                    <IoCallOutline className="phone-icon" />
                    <span className="task-phone">{task.phone}</span>
                  </div>
                  
                  <div className="task-details">
                    <span className="task-method">{task.method}</span>
                    <div className="task-person">
                      <div 
                        className="person-avatar" 
                        style={{ backgroundColor: task.avatarColor }}
                      >
                        {task.person?.charAt(0) || '?'}
                      </div>
                      <span className="person-name">
                        {task.person}
                      </span>
                      <FiChevronRight className="chevron-icon" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-tasks">
              {searchTerm ? "No matching tasks found" : "No tasks scheduled"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Tasks;