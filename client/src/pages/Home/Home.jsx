import React, { useEffect, useState } from "react";
import "./home.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from "chart.js";
import { FiUser, FiTrendingUp, FiDollarSign, FiAlertCircle, FiClock, } from "react-icons/fi";
import { CiTimer } from "react-icons/ci";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-banner">
          <FiAlertCircle className="error-icon" />
          <span>Something went wrong in this component.</span>
        </div>
      );
    }

    return this.props.children;
  }
}

const Home = () => {
  const [employees, setEmployees] = useState([]);
  const [leads, setLeads] = useState([]);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Unauthorized: No token found. Please login.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const fetchData = async () => {
      try {
        const [empRes, leadRes, actRes] = await Promise.all([
          fetch("https://sales-backend-mern-production.up.railway.app/api/employees", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("https://sales-backend-mern-production.up.railway.app/api/leads", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("https://sales-backend-mern-production.up.railway.app/api/activities", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!empRes.ok || !leadRes.ok || !actRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [empData, leadData, actData] = await Promise.all([
          empRes.json(),
          leadRes.json(),
          actRes.json(),
        ]);

        setEmployees(Array.isArray(empData) ? empData : []);
        setLeads(Array.isArray(leadData) ? leadData : []);
        setActivities(Array.isArray(actData) ? actData.slice(-15).reverse() : []);
        setError("");
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to fetch data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSelectAll = (e) => {
    setSelectedEmployees(
      e.target.checked ? employees.map(emp => emp._id) : []
    );
  };

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const totalAssignedLeads = employees.reduce((sum, emp) => sum + (emp.Assigned || 0), 0);
  const totalClosedLeads = employees.reduce((sum, emp) => sum + (emp.Closed_leads || 0), 0);
  const activeSalespeople = employees.filter(emp => emp.status === "Active").length;
  const unassignedLeads = leads.filter(lead => !lead.assignedTo).length;
  const conversionRate = totalAssignedLeads
    ? Math.round((totalClosedLeads / totalAssignedLeads) * 100)
    : 0;

  const weekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const closedLeadsPerDay = Array(7).fill(0);


  leads.forEach(lead => {
    if (lead.status === "Closed") {
      const date = new Date(lead.updatedAt || lead.createdAt || lead.leadDate);
      closedLeadsPerDay[date.getDay()]++;
    }
  });

  const chartData = {
    labels: weekLabels,
    datasets: [{
      label: "Closed Leads",
      data: closedLeadsPerDay,
      backgroundColor: "rgba(99, 102, 241, 0.7)",
      hoverBackgroundColor: "rgba(99, 102, 241, 1)",
      borderRadius: 6,
      borderSkipped: false
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return `Closed Leads: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(226, 232, 240, 0.5)" },
        ticks: { color: "#64748b" }
      },
      x: {
        grid: { display: false },
        ticks: { color: "#64748b" }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="home-container">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="home-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard Overview</h1>
          <div className="header-actions">
            <button className="refresh-btn">
              <FiClock className="refresh-icon" />
              Last updated: Just now
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <FiAlertCircle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon unassigned">
              <FiUser />
            </div>
            <div className="stat-content">
              <span className="stat-label">unassigned leads</span>
              <span className="stat-value">{unassignedLeads}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon assigned">
              <FiTrendingUp />
            </div>
            <div className="stat-content">
              <span className="stat-label">Assigned Leads</span>
              <span className="stat-value">{totalAssignedLeads}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon active">
              <FiUser />
            </div>
            <div className="stat-content">
              <span className="stat-label">Active Employees</span>
              <span className="stat-value">{activeSalespeople}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon conversion">
              <FiDollarSign />
            </div>
            <div className="stat-content">
              <span className="stat-label">Conversion Rate</span>
              <span className="stat-value">{conversionRate}%</span>
            </div>
          </div>
        </div>

        <div className="analytics-section">
          <div className="chart-container">
            <div className="section-header">
              <h2 className="section-title">Closed Leads Analytics</h2>
              <select className="time-selector">
                <option>Last 7 Days</option>
              </select>
            </div>
            <div className="chart-wrapper">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="activity-container">
            <div className="section-header">
              <h2 className="section-title">Recent Activity</h2>
            </div>
            <ul className="activity-list">
              {activities.map((activity, index) => (
                <li key={index} className="activity-item">
                  <div className="activity-icon"><CiTimer /></div>
                  <div className="activity-content">
                    <p className="activity-text">{activity.activity_string}</p>
                    <span className="activity-time">
                      {new Date(activity.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="table-container">
          <div className="table-header">
            <h2 className="section-title">Team Performance</h2>
          </div>
          <div className="table-scroll">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className="table-checkbox"
                      checked={selectedEmployees.length === employees.length && employees.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Employee</th>
                  <th>Location</th>
                  <th>Language</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Assigned</th>
                </tr>
              </thead>
              <tbody>
                {employees.length > 0 ? (
                  employees.map(emp => (
                    <tr key={emp._id} className="table-row">
                      <td>
                        <input
                          type="checkbox"
                          className="table-checkbox"
                          checked={selectedEmployees.includes(emp._id)}
                          onChange={() => handleEmployeeSelect(emp._id)}
                        />
                      </td>
                      <td>
                        <div className="employee-info">
                          <div className="employee-avatar">
                            {emp.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="employee-details">
                            <span className="employee-name">{emp.name}</span>
                            <span className="employee-email">{emp.email}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="table-text">{emp.location || "—"}</span></td>
                      <td><span className="table-text">{emp.language || "—"}</span></td>
                      <td><span className="table-text">{emp.role || "—"}</span></td>
                      <td>
                        <span className={`status-badge ${emp.status?.toLowerCase()}`}>
                          {emp.status || "Inactive"}
                        </span>
                      </td>
                      <td><span className="table-value">{emp.Assigned || 0}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr className="empty-row">
                    <td colSpan="7">
                      <div className="empty-state">
                        No employee data available
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Home;