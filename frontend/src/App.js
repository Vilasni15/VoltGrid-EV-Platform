import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [role, setRole] = useState('User');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [view, setView] = useState('map');
  const [selectedStation, setSelectedStation] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [bookings, setBookings] = useState([]);
  const [currentReceipt, setCurrentReceipt] = useState(null);

  const API_BASE_URL = "https://voltgrid-api.onrender.com";

  useEffect(() => {
    if (isLoggedIn && (role === 'Admin' || role === 'Attendant')) {
      fetch(`${API_BASE_URL}/bookings`)
        .then(res => res.json())
        .then(data => setBookings(data))
        .catch(err => console.error("Error fetching:", err));
    }
  }, [isLoggedIn, role]);

  const handleLogin = () => {
    const user = credentials.username.trim().toLowerCase();
    const pass = credentials.password.trim();

    if (role === 'Admin' && user === 'admin' && pass === 'admin123') {
      setIsLoggedIn(true);
    } else if (role === 'Attendant' && user === 'staff' && pass === 'staff123') {
      setIsLoggedIn(true);
    } else if (role === 'User') {
      if (!user) {
        alert("Please enter your name to continue!");
        return;
      }
      setIsLoggedIn(true);
    } else {
      alert("Invalid Credentials!");
    }
  };

  const handleBooking = async () => {
    if (!vehicleNumber.trim() || !credentials.username.trim()) {
      alert("Please enter both your Name and Vehicle Number!");
      return;
    }

    const newBooking = {
      username: credentials.username.trim(),
      vehicle_number: vehicleNumber.trim(),
      vehicle_type: vehicleType,
      station_name: selectedStation.name,
      status: "Arriving",
      payment_status: "Pending"
    };

    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      });
      const data = await response.json();
      setCurrentReceipt(data);
      setView('receipt');
    } catch (error) {
      alert("Booking failed. Is the server awake?");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>Platform Access</h2>
          <div className="role-selector">
            <button className={role === 'User' ? 'active' : ''} onClick={() => setRole('User')}>User</button>
            <button className={role === 'Attendant' ? 'active' : ''} onClick={() => setRole('Attendant')}>Attendant</button>
            <button className={role === 'Admin' ? 'active' : ''} onClick={() => setRole('Admin')}>Admin</button>
          </div>
          <input 
            type="text" 
            placeholder="Username / Your Name" 
            autoCapitalize="none" 
            autoCorrect="off"
            onChange={(e) => setCredentials({...credentials, username: e.target.value})} 
          />
          {role !== 'User' && (
            <input 
              type="password" 
              placeholder="Password" 
              onChange={(e) => setCredentials({...credentials, password: e.target.value})} 
            />
          )}
          <button className="primary-btn" onClick={handleLogin}>Secure Login</button>
        </div>
      </div>
    );
  }

  if (role === 'Admin' || role === 'Attendant') {
    return (
      <div className="dashboard">
        <nav>
          <h1>VOLTGRID {role.toUpperCase()}</h1>
          <button onClick={() => setIsLoggedIn(false)}>Sign Out</button>
        </nav>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Driver Name</th>
                <th>Vehicle</th>
                <th>Station</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, index) => (
                <tr key={index}>
                  <td>{b.username}</td>
                  <td>{b.vehicle_number} ({b.vehicle_type})</td>
                  <td>{b.station_name}</td>
                  <td><span className={`badge ${b.status}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav>
        <h1>VOLTGRID</h1>
        <button onClick={() => setIsLoggedIn(false)}>Sign Out</button>
      </nav>
      {view === 'map' && (
        <div className="station-list">
          {[{name: "T Nagar Hub", cap: "150kW"}, {name: "Guindy Tech Grid", cap: "250kW"}].map((s, index) => (
            <div key={index} className="station-card">
              <h3>{s.name}</h3>
              <p>{s.cap} • Available Now</p>
              <button onClick={() => { setSelectedStation(s); setView('booking'); }}>Book Slot</button>
            </div>
          ))}
        </div>
      )}

      {view === 'booking' && (
        <div className="booking-form">
          <h2>Booking: {selectedStation.name}</h2>
          <input 
            type="text" 
            placeholder="Enter Vehicle Number" 
            value={vehicleNumber} 
            onChange={(e) => setVehicleNumber(e.target.value)} 
          />
          <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
            <option value="Auto">Auto</option>
          </select>
          <button className="primary-btn" onClick={handleBooking}>Confirm & Generate Receipt</button>
          <button className="secondary-btn" onClick={() => setView('map')}>Cancel</button>
        </div>
      )}

      {view === 'receipt' && (
        <div className="receipt-card">
          <div className="success-icon">✓</div>
          <h2>Booking Confirmed!</h2>
          <p><strong>Receipt ID:</strong> {currentReceipt?.receipt_id}</p>
          <p><strong>Driver:</strong> {currentReceipt?.username}</p>
          <p><strong>Vehicle:</strong> {currentReceipt?.vehicle_number}</p>
          <button onClick={() => { setView('map'); setVehicleNumber(''); }}>Back to Home</button>
        </div>
      )}
    </div>
  );
}

export default App;