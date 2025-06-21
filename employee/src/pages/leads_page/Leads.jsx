import React, { useState, useEffect } from 'react';
import './Leads.css';
import axios from 'axios';
import {
  FiSearch,
  FiEdit,
  FiClock,
  FiChevronDown,
  FiCalendar,
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiPlus,
  FiArrowLeft,
} from 'react-icons/fi';

const Leads = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [leads, setLeads] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const id = localStorage.getItem('id');

        const response = await axios.get(`https://sales-backend-mern-production.up.railway.app/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEmployee(response.data);
        setLeads(response.data.assignedLeads ? response.data.assignedLeads.reverse() : []);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleDropdown = (leadId, dropdownType) => {
    setActiveDropdown(activeDropdown === `${leadId}-${dropdownType}` ? null : `${leadId}-${dropdownType}`);
  };

  const updateLeadProperty = async (leadId, property, value) => {
    try {
      const token = localStorage.getItem('token');
      const lead = leads.find(l => l._id === leadId);

      if (!lead || lead[property] === value) return;

      const previousStatus = lead.status;

      await axios.patch(
        `https://sales-backend-mern-production.up.railway.app/api/leads/${leadId}`,
        { [property]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLeads(leads.map(l => l._id === leadId ? { ...l, [property]: value } : l));

      if (property === 'status' && value === 'Closed' && previousStatus !== 'Closed') {
        const employeeId = localStorage.getItem('id');
        if (employeeId) {
          await axios.patch(
            `https://sales-backend-mern-production.up.railway.app/api/employees/${employeeId}`,
            { $inc: { Closed_leads: 1 } },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setEmployee(prevEmp => prevEmp ? { ...prevEmp, Closed_leads: (prevEmp.Closed_leads || 0) + 1 } : null);
        }
      } else if (property === 'status' && previousStatus === 'Closed' && value !== 'Closed') {
        const employeeId = localStorage.getItem('id');
        if (employeeId) {
          await axios.patch(
            `https://sales-backend-mern-production.up.railway.app/api/employees/${employeeId}`,
            { $inc: { Closed_leads: -1 } },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setEmployee(prevEmp => prevEmp ? { ...prevEmp, Closed_leads: Math.max(0, (prevEmp.Closed_leads || 0) - 1) } : null);
        }
      }

      const empName = employee?.name || 'Someone';
      const propertyName = property === 'status' ? 'status' : 'type';
      const readableActivity = property === 'status' ? 'Updated Status' : 'Updated Type';

      await axios.post(
        'https://sales-backend-mern-production.up.railway.app/api/activities/add',
        {
          activity_string: `${empName} updated ${propertyName} to ${value}`,
          activity: [readableActivity],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setActiveDropdown(null);
    } catch (err) {
      console.error('Error updating lead or posting activity:', err);
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone?.includes(searchTerm) ||
    lead.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusClass = (status) => {
    switch (status) {
      case 'New': return 'status-new';
      case 'Contacted': return 'status-contacted';
      case 'Qualified': return 'status-qualified';
      case 'Ongoing': return 'status-ongoing';
      case 'Closed': return 'status-closed';
      default: return 'status-default';
    }
  };

  if (isLoading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="leads-page">
      {/* Beautiful Gradient Header */}
      <div className="header">
        <div className="header-content">
          <button className="back-button" onClick={() => window.history.back()}>
            <FiArrowLeft />
          </button>
          <div className="header-title">
            <h1>Leads
            
            </h1>
          </div>
          <div style={{ width: '40px' }}></div>
        </div>
      </div>

      <div className="leads-content-area">
        <div className="search-filter-bar">
          <div className="search-box">
            <FiSearch className="icon" />
            <input
              type="text"
              placeholder="Search" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="clear-icon">
                <FiX />
              </button>
            )}
          </div>
        </div>

        <div className="leads-list">
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead) => (
              <div key={lead._id} className={`lead-card ${lead.type ? lead.type.toLowerCase() + '-lead' : 'default-lead'}`}>
                <div className="card-content">
                  <div className="card-header">
                    <div>
                      <h3>{lead.name || 'No name'}</h3>
                      <div className="contact-info">
                        <span><FiMail /> {lead.email || 'No email'}</span>
                        <span><FiPhone /> {lead.phone || 'No phone'}</span>
                      </div>
                    </div>
                    <div className="card-actions">
                      <div className={`status-badge ${getStatusClass(lead.status)}`}>
                        {lead.status || 'New'}
                      </div>
                      <div className="action-buttons">
                        <button onClick={() => toggleDropdown(lead._id, 'type')}><FiEdit /></button>
                        <button onClick={() => toggleDropdown(lead._id, 'schedule')}><FiClock /></button>
                        <button onClick={() => toggleDropdown(lead._id, 'status')}><FiChevronDown /></button>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <span><FiUser /> {employee?.name || 'Unassigned'}</span>
                    <span><FiCalendar /> {new Date(lead.leadDate).toLocaleDateString()}</span>
                  </div>

                  {activeDropdown === `${lead._id}-type` && (
                    <div className="dropdown type-dropdown">
                      {['Hot', 'Warm', 'Cold'].map((type) => (
                        <button key={type} onClick={() => updateLeadProperty(lead._id, 'type', type)} className={`type-${type.toLowerCase()}`}>
                          {type} Lead
                        </button>
                      ))}
                    </div>
                  )}
                  {activeDropdown === `${lead._id}-status` && (
                    <div className="dropdown status-dropdown">
                      {['New', 'Contacted', 'Qualified', 'Ongoing', 'Closed'].map((status) => (
                        <button key={status} onClick={() => updateLeadProperty(lead._id, 'status', status)} className={getStatusClass(status)}>
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                  {activeDropdown === `${lead._id}-schedule` && (
                    <div className="dropdown schedule-dropdown">
                      <button>Schedule Call</button>
                      <button>Schedule Meeting</button>
                      <button>Set Reminder</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (<div></div>)}
        </div>
      </div>
    </div>
  );
};

export default Leads;