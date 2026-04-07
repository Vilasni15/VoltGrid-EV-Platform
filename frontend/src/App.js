import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

// Guaranteed visible marker
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Controller to smoothly fly the map exactly to the selected coordinates
function MapController({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    setTimeout(() => {
      map.invalidateSize(); 
      map.flyTo(center, zoom, { animate: true, duration: 1.5 });
    }, 150);
  }, [center, zoom, map]);
  return null;
}

const cityData = {
  Chennai: { center: [13.0827, 80.2707], stations: [
    { name: "T Nagar Hub", cap: "150kW", slots: 3, lat: 13.0418, lng: 80.2341 },
    { name: "Guindy Tech Grid", cap: "250kW", slots: 1, lat: 13.0067, lng: 80.2206 },
    { name: "Saveetha EcoCharge", cap: "100kW", slots: 5, lat: 13.0285, lng: 80.0166 },
    { name: "Marina Beach Plugs", cap: "50kW", slots: 2, lat: 13.0500, lng: 80.2824 },
    { name: "Velachery Mall Fast Charge", cap: "150kW", slots: 4, lat: 12.9815, lng: 80.2180 },
    { name: "Anna Nagar Supercharger", cap: "250kW", slots: 0, lat: 13.0850, lng: 80.2101 },
    { name: "OMR IT Corridor", cap: "100kW", slots: 8, lat: 12.9010, lng: 80.2279 },
    { name: "Adyar Fast Grid", cap: "150kW", slots: 4, lat: 13.0012, lng: 80.2565 }
  ]},
  Bangalore: { center: [12.9716, 77.5946], stations: [
    { name: "Koramangala Charge", cap: "150kW", slots: 4, lat: 12.9352, lng: 77.6245 },
    { name: "Indiranagar EV", cap: "250kW", slots: 2, lat: 12.9784, lng: 77.6408 },
    { name: "Whitefield IT Plug", cap: "100kW", slots: 6, lat: 12.9698, lng: 77.7499 },
    { name: "Electronic City Hub", cap: "350kW", slots: 1, lat: 12.8452, lng: 77.6602 },
    { name: "MG Road Central", cap: "150kW", slots: 3, lat: 12.9719, lng: 77.6013 },
    { name: "Jayanagar Eco", cap: "50kW", slots: 5, lat: 12.9299, lng: 77.5834 },
    { name: "Malleshwaram Power", cap: "100kW", slots: 2, lat: 13.0031, lng: 77.5643 },
    { name: "Hebbal FastLink", cap: "250kW", slots: 4, lat: 13.0354, lng: 77.5988 }
  ]},
  Hyderabad: { center: [17.3850, 78.4867], stations: [
    { name: "HITEC City Supercharge", cap: "250kW", slots: 4, lat: 17.4435, lng: 78.3772 },
    { name: "Banjara Hills Premium", cap: "150kW", slots: 2, lat: 17.4156, lng: 78.4347 },
    { name: "Jubilee Hills Plug", cap: "100kW", slots: 0, lat: 17.4326, lng: 78.4071 },
    { name: "Gachibowli IT Grid", cap: "350kW", slots: 5, lat: 17.4401, lng: 78.3489 },
    { name: "Secunderabad Station", cap: "50kW", slots: 3, lat: 17.4399, lng: 78.4983 },
    { name: "Kukatpally Eco", cap: "150kW", slots: 6, lat: 17.4849, lng: 78.3894 },
    { name: "Madhapur Fast", cap: "250kW", slots: 1, lat: 17.4483, lng: 78.3915 },
    { name: "Begumpet Central", cap: "100kW", slots: 4, lat: 17.4423, lng: 78.4641 }
  ]},
  Mumbai: { center: [19.0760, 72.8777], stations: [
    { name: "BKC Business Plug", cap: "250kW", slots: 2, lat: 19.0653, lng: 72.8658 },
    { name: "Andheri West Hub", cap: "150kW", slots: 5, lat: 19.1363, lng: 72.8277 },
    { name: "Worli Seaface Charge", cap: "100kW", slots: 1, lat: 19.0169, lng: 72.8166 },
    { name: "Powai Lake Eco", cap: "150kW", slots: 4, lat: 19.1176, lng: 72.9060 },
    { name: "Lower Parel Power", cap: "350kW", slots: 3, lat: 18.9953, lng: 72.8282 },
    { name: "Colaba FastLink", cap: "50kW", slots: 6, lat: 18.9067, lng: 72.8147 },
    { name: "Bandra Kurla Charge", cap: "250kW", slots: 2, lat: 19.0596, lng: 72.8295 },
    { name: "Goregaon Tech", cap: "150kW", slots: 4, lat: 19.1646, lng: 72.8493 }
  ]},
  Delhi: { center: [28.6139, 77.2090], stations: [
    { name: "Connaught Place Hub", cap: "250kW", slots: 3, lat: 28.6304, lng: 77.2177 },
    { name: "Saket Mall Charge", cap: "150kW", slots: 5, lat: 28.5246, lng: 77.2066 },
    { name: "Vasant Kunj Plug", cap: "100kW", slots: 2, lat: 28.5293, lng: 77.1541 },
    { name: "Gurugram Cyber City", cap: "350kW", slots: 1, lat: 28.4901, lng: 77.0888 },
    { name: "Noida Sector 18", cap: "250kW", slots: 4, lat: 28.5708, lng: 77.3204 },
    { name: "Dwarka Eco Station", cap: "50kW", slots: 6, lat: 28.5796, lng: 77.0500 },
    { name: "Hauz Khas FastLink", cap: "150kW", slots: 3, lat: 28.5494, lng: 77.2001 },
    { name: "Aerocity Premium", cap: "250kW", slots: 8, lat: 28.5492, lng: 77.1213 }
  ]}
};

function App() {
  const [globalBookings, setGlobalBookings] = useState([
    { id: "VG-797723", user_name: "vilasni", vehicle_type: "Car", vehicle_number: "TN-22-DA-2416", station_name: "Velachery Mall Fast Charge", date: "2026-04-13", time: "14:30", payment_method: "Cash", payment_status: "Paid (Cash Collected)", charging_status: "Completed", verification_status: "Verified & Dispatched 🟢" },
    { id: "VG-253447", user_name: "radhesh", vehicle_type: "Car", vehicle_number: "TN-22-DA-9876", station_name: "Guindy Tech Grid", date: "2026-04-13", time: "06:00", payment_method: "UPI", payment_status: "Paid (UPI)", charging_status: "Arriving...", verification_status: "Active in Bay" }
  ]);

  const [role, setRole] = useState('User');
  const [isAuthModeLogin, setIsAuthModeLogin] = useState(true); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [view, setView] = useState('map'); 
  const [selectedCity, setSelectedCity] = useState('Chennai');
  const [selectedStation, setSelectedStation] = useState(null);
  
  const [mapCenter, setMapCenter] = useState(cityData['Chennai'].center);
  const [mapZoom, setMapZoom] = useState(11);
  
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [currentReceipt, setCurrentReceipt] = useState(null);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setUsername('');
    setPassword('');
  };

  const handleCityClick = (city) => {
    setSelectedCity(city);
    setMapCenter(cityData[city].center);
    setMapZoom(11); 
  };

  const handleStationJump = (station) => {
    setMapCenter([station.lat, station.lng]);
    setMapZoom(16); 
  };

  const handleBooking = () => {
    if(!username || !vehicleNumber || !bookDate || !bookTime) {
      alert("Please fill all booking details!");
      return;
    }
    const newId = `VG-${Math.floor(100000 + Math.random() * 900000)}`;
    const receipt = {
      id: newId,
      user_name: username,
      vehicle_number: vehicleNumber,
      vehicle_type: vehicleType,
      station_name: selectedStation.name,
      date: bookDate,
      time: bookTime,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'UPI' ? 'Paid (UPI)' : 'Pending (Cash)',
      charging_status: 'Arriving...',
      verification_status: 'Active in Bay'
    };
    
    setGlobalBookings([receipt, ...globalBookings]); 
    setCurrentReceipt(receipt);
    setView('receipt');
  };

  const handleDownloadFile = () => {
    const receiptContent = `
=================================
       VOLTGRID RECEIPT
=================================
Receipt ID:    ${currentReceipt.id}
Driver Name:   ${currentReceipt.user_name}
Vehicle:       ${currentReceipt.vehicle_type} (${currentReceipt.vehicle_number})
Terminal Hub:  ${currentReceipt.station_name}
Scheduled:     ${currentReceipt.date} @ ${currentReceipt.time}
Authorization: ${currentReceipt.payment_status}
=================================
Thank you for choosing VoltGrid!
    `;
    const element = document.createElement("a");
    const file = new Blob([receiptContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${currentReceipt.id}_Receipt.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleStatusUpdate = (id, field, value) => {
    setGlobalBookings(globalBookings.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleDispatch = (id) => {
    setGlobalBookings(globalBookings.map(b => b.id === id ? { ...b, verification_status: "Verified & Dispatched 🟢" } : b));
  };

  if (!isLoggedIn) {
    return (
      <div className="wrapper bg-light">
        <nav className="top-nav shadow-sm"><h1>VOLTGRID</h1></nav>
        <div className="center-container">
          <div className="card shadow-lg">
            <h2 className="text-center mb-2">Platform Access</h2>
            
            <div className="animated-toggle mb-2">
              <div className={`slider-pill ${role.toLowerCase()}`}></div>
              <button className={`toggle-btn ${role === 'User' ? 'active' : ''}`} onClick={() => handleRoleChange('User')}>User</button>
              <button className={`toggle-btn ${role === 'Attendant' ? 'active' : ''}`} onClick={() => handleRoleChange('Attendant')}>Attendant</button>
              <button className={`toggle-btn ${role === 'Admin' ? 'active' : ''}`} onClick={() => handleRoleChange('Admin')}>Admin</button>
            </div>

            {role === 'User' && (
              <div className="auth-mode-links mb-1">
                <span className={isAuthModeLogin ? 'active-link' : ''} onClick={() => setIsAuthModeLogin(true)}>Login</span>
                <span className="divider">|</span>
                <span className={!isAuthModeLogin ? 'active-link' : ''} onClick={() => setIsAuthModeLogin(false)}>Sign Up</span>
              </div>
            )}

            <div className="input-group">
              <label>Name / Username</label>
              <input type="text" className="styled-input" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            
            {role !== 'User' && (
              <div className="input-group mt-1">
                <label>Password</label>
                <input type="password" className="styled-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            )}
            
            {role === 'User' && !isAuthModeLogin && (
              <div className="input-group mt-1">
                <label>Email (For Sign Up)</label>
                <input type="email" className="styled-input" placeholder="user@email.com" />
              </div>
            )}

            <button className="btn-black w-100 mt-2" onClick={() => { if(username) setIsLoggedIn(true); else alert("Enter your username"); }}>
              {role === 'User' && !isAuthModeLogin ? 'Sign Up & Continue' : 'Secure Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (role === 'Attendant' || role === 'Admin') {
    return (
      <div className="wrapper bg-light">
        <nav className="top-nav shadow-sm">
          <h1>VOLTGRID {role.toUpperCase()}</h1>
          <button className="btn-outline" onClick={() => setIsLoggedIn(false)}>Sign Out</button>
        </nav>
        <div className="dashboard-container">
          <h2 className="mb-2">{role === 'Admin' ? 'Admin Command Center' : 'Station Attendant Portal'}</h2>
          <div className="table-responsive shadow-sm">
            <table>
              <thead>
                <tr>
                  <th>Driver Info</th>
                  <th>Vehicle Details</th>
                  <th>Schedule</th>
                  <th>Location</th>
                  <th>Telemetry & Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {globalBookings.map((b) => (
                  <tr key={b.id}>
                    <td><strong className="text-dark">{b.user_name}</strong><br/><small className="text-muted">{b.id}</small></td>
                    <td><strong className="text-dark">{b.vehicle_number}</strong><br/><small className="text-muted">{b.vehicle_type}</small></td>
                    <td><span className="text-dark">{b.date}</span><br/><small className="text-muted">{b.time}</small></td>
                    <td><strong>{b.station_name}</strong></td>
                    <td>
                      {role === 'Attendant' ? (
                        <div className="status-controls">
                          <select value={b.charging_status} onChange={(e) => handleStatusUpdate(b.id, 'charging_status', e.target.value)} className="styled-select mb-1">
                            <option>Arriving...</option><option>Charging</option><option>Completed</option>
                          </select>
                          <select value={b.payment_status} onChange={(e) => handleStatusUpdate(b.id, 'payment_status', e.target.value)} className="styled-select">
                            <option>Pending</option><option>Paid (UPI)</option><option>Paid (Cash Collected)</option>
                          </select>
                        </div>
                      ) : (
                        <div className="status-display">
                          <span className={`status-badge ${b.charging_status === 'Completed' ? 'bg-green' : 'bg-yellow'}`}>Charge: {b.charging_status}</span>
                          <span className="status-badge bg-gray mt-1">Pay: {b.payment_status}</span>
                        </div>
                      )}
                    </td>
                    <td className="align-middle">
                      {b.verification_status === "Verified & Dispatched 🟢" ? (
                        <span className="success-text font-bold">✓ Dispatched</span>
                      ) : (
                        role === 'Attendant' ? 
                        <button className="btn-black btn-small" onClick={() => handleDispatch(b.id)}>Dispatch Vehicle</button> :
                        <span className="pending-text font-bold">Active in Bay</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper bg-light">
      <nav className="top-nav shadow-sm">
        <h1>VOLTGRID</h1>
        <div className="nav-right">
          <span className="user-greeting">Welcome, <strong>{username}</strong></span>
          <button className="btn-outline" onClick={() => setIsLoggedIn(false)}>Sign Out</button>
        </div>
      </nav>

      {view === 'map' && (
        <div className="map-layout">
          <div className="top-panel shadow-sm">
            <div className="city-filters">
              {Object.keys(cityData).map(city => (
                <button key={city} className={`city-btn ${selectedCity === city ? 'active' : ''}`} onClick={() => handleCityClick(city)}>
                  {city}
                </button>
              ))}
            </div>
            <div className="station-carousel">
              {cityData[selectedCity].stations.map((s, i) => (
                <div key={i} className="station-card shadow-sm" onClick={() => handleStationJump(s)}>
                  <h3>{s.name}</h3>
                  <p className="text-muted">Capacity: {s.cap}</p>
                  <div className="station-footer">
                    <span className="slot-badge">{s.slots} Slots Available</span>
                    <button className="btn-black btn-small" onClick={(e) => { e.stopPropagation(); setSelectedStation(s); setView('booking'); }}>Initiate Booking</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="map-area">
            <div className="map-frame shadow-sm">
              {/* THE ULTIMATE FIX: Hardcoding height directly onto the MapContainer! */}
              <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '500px', width: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                <MapController center={mapCenter} zoom={mapZoom} />
                {cityData[selectedCity].stations.map((s, i) => (
                  <Marker key={i} position={[s.lat, s.lng]} icon={customIcon}>
                    <Popup><strong>{s.name}</strong><br/>{s.slots} Slots Available</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {view === 'booking' && (
        <div className="center-container">
          <div className="card shadow-lg">
            <h2 className="text-center">Reservation Setup</h2>
            <p className="text-center text-muted mb-2">Terminal: <strong>{selectedStation.name}</strong></p>
            
            <div className="form-row">
              <div className="input-group">
                <label>Vehicle Type</label>
                <select className="styled-input" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                  <option>Car</option><option>Bike</option><option>Auto</option>
                </select>
              </div>
              <div className="input-group">
                <label>Vehicle Plate Number</label>
                <input type="text" className="styled-input" placeholder="e.g. TN-01-AB-1234" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label>Arrival Date 📅</label>
                <input type="date" className="styled-input" value={bookDate} onChange={(e) => setBookDate(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Arrival Time 🕒</label>
                <input type="time" className="styled-input" value={bookTime} onChange={(e) => setBookTime(e.target.value)} />
              </div>
            </div>
            
            <label className="label-bold">Payment Authorization</label>
            <div className="animated-toggle mt-1 mb-2">
               <div className={`slider-pill half ${paymentMethod === 'Cash' ? 'right' : 'left'}`}></div>
               <button className={`toggle-btn ${paymentMethod === 'UPI' ? 'active' : ''}`} onClick={() => setPaymentMethod('UPI')}>Digital UPI</button>
               <button className={`toggle-btn ${paymentMethod === 'Cash' ? 'active' : ''}`} onClick={() => setPaymentMethod('Cash')}>Pay at Terminal</button>
            </div>

            {paymentMethod === 'UPI' && (
              <div className="qr-box">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=voltgrid@upi&pn=VoltGrid&am=450" alt="QR Code" />
                <p className="font-bold mt-1">Scan to authorize Rs. 450</p>
              </div>
            )}

            <button className="btn-black w-100 mt-1" onClick={handleBooking}>Confirm & Generate Receipt</button>
            <button className="btn-outline w-100 mt-1" onClick={() => setView('map')}>Cancel Reservation</button>
          </div>
        </div>
      )}

      {view === 'receipt' && (
        <div className="center-container">
          <div className="card shadow-lg receipt-view">
            <div className="text-center mb-2">
              <span className="success-icon">✓</span>
              <h2>Transaction Complete</h2>
            </div>
            <div className="receipt-box">
              <div className="receipt-row"><span>Receipt ID</span><strong>{currentReceipt.id}</strong></div>
              <div className="receipt-row"><span>Driver Name</span><strong>{currentReceipt.user_name}</strong></div>
              <div className="receipt-row"><span>Vehicle</span><strong>{currentReceipt.vehicle_type} ({currentReceipt.vehicle_number})</strong></div>
              <div className="receipt-row"><span>Terminal Hub</span><strong>{currentReceipt.station_name}</strong></div>
              <div className="receipt-row"><span>Scheduled</span><strong>{currentReceipt.date} @ {currentReceipt.time}</strong></div>
              <div className="receipt-row border-none"><span>Authorization</span><strong>{currentReceipt.payment_status}</strong></div>
            </div>
            <button className="btn-black w-100 mt-2" onClick={handleDownloadFile}>Download Text Receipt</button>
            <button className="btn-outline w-100 mt-1" onClick={() => { setView('map'); setVehicleNumber(''); setBookDate(''); setBookTime(''); }}>Return to Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;