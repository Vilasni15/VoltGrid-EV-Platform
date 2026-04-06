import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import './App.css';

// Fix for default map icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapMover = ({ targetLocation, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (targetLocation) map.flyTo([targetLocation.lat, targetLocation.lng], zoom, { duration: 1.5 });
  }, [targetLocation, zoom, map]);
  return null;
};

function App() {
  const [currentView, setCurrentView] = useState('login'); 
  const [userRole, setUserRole] = useState('user'); 
  const [loginCreds, setLoginCreds] = useState({ id: '', password: '' });
  
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [cityFilter, setCityFilter] = useState('All');
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); 
  const [mapZoom, setMapZoom] = useState(5);
  
  const [bookingDetails, setBookingDetails] = useState({ date: '', time: '', vehicleNumber: '' });
  const [receiptData, setReceiptData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [adminBookings, setAdminBookings] = useState([]);

  const fetchStations = () => fetch('http://localhost:8000/api/stations').then(res => res.json()).then(setStations);
  const fetchAdminBookings = () => fetch('http://localhost:8000/api/admin/bookings').then(res => res.json()).then(setAdminBookings);

  useEffect(() => {
    if (currentView === 'app') fetchStations();
    if (currentView === 'admin') {
        fetchAdminBookings();
        const interval = setInterval(fetchAdminBookings, 3000);
        return () => clearInterval(interval);
    }
  }, [currentView]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (userRole === 'admin') {
      if (loginCreds.id === 'admin' && loginCreds.password === '123') setCurrentView('admin');
      else alert("Incorrect Admin Credentials!");
    } else {
      setCurrentView('app');
    }
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setCityFilter(city);
    setSelectedStation(null);
    if (city === 'Chennai') { setMapCenter({lat: 13.0827, lng: 80.2707}); setMapZoom(11); }
    else if (city === 'Bangalore') { setMapCenter({lat: 12.9716, lng: 77.5946}); setMapZoom(11); }
    else if (city === 'Hyderabad') { setMapCenter({lat: 17.3850, lng: 78.4867}); setMapZoom(11); }
    else if (city === 'Mumbai') { setMapCenter({lat: 19.0760, lng: 72.8777}); setMapZoom(11); }
    else if (city === 'Delhi') { setMapCenter({lat: 28.7041, lng: 77.1025}); setMapZoom(11); }
    else { setMapCenter({lat: 20.5937, lng: 78.9629}); setMapZoom(5); }
  };

  const processPayment = async () => {
    const response = await fetch('http://localhost:8000/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        station_id: selectedStation.id,
        user_name: loginCreds.id || 'EV User',
        vehicle_number: bookingDetails.vehicleNumber.toUpperCase(),
        date: bookingDetails.date,
        time: bookingDetails.time,
        payment_method: paymentMethod
      })
    });
    const result = await response.json();
    if (response.ok) {
      setReceiptData(result.booking_details);
      setCurrentView('receipt');
    }
  };

  const downloadReceipt = () => {
    const receiptText = `VOLTGRID EV CHARGING RECEIPT\n------------------------------\nBooking ID: ${receiptData.id}\nDriver Name: ${receiptData.user_name}\nVehicle Reg: ${receiptData.vehicle_number}\nLocation: ${receiptData.station_name}\nDate & Time: ${receiptData.date} @ ${receiptData.time}\nPayment Method: ${receiptData.payment_method}\nAmount: ₹450\n------------------------------\nThank you for using VoltGrid!`;
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `VoltGrid_Receipt_${receiptData.id}.txt`;
    link.click();
  };

  // --- THIS IS THE MISSING LINE THAT CAUSED THE ERROR ---
  const filteredStations = cityFilter === 'All' ? stations : stations.filter(s => s.city === cityFilter);

  // LIGHT THEME STYLES
  const theme = { 
    bg: '#F8FAFC', 
    panel: '#FFFFFF', 
    accent: '#10B981', 
    text: '#0F172A', 
    subtext: '#64748B', 
    border: '#E2E8F0' 
  };
  
  const cardStyle = { 
    background: theme.panel, 
    border: `1px solid ${theme.border}`, 
    borderRadius: '12px', 
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' 
  };

  const inputStyle = {
    width: '100%', padding: '14px', marginBottom: '20px', borderRadius: '8px', 
    background: '#F1F5F9', border: `1px solid ${theme.border}`, 
    color: theme.text, fontSize: '16px', boxSizing: 'border-box',
    outlineColor: theme.accent
  };

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, minHeight: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 40px', background: '#FFFFFF', borderBottom: `1px solid ${theme.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: theme.accent, fontSize: '28px', fontWeight: '900', margin: 0 }}>⚡ VOLTGRID</h1>
        {currentView !== 'login' && (
          <button onClick={() => setCurrentView('login')} style={{ background: '#F1F5F9', color: theme.text, border: `1px solid ${theme.border}`, padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Sign Out</button>
        )}
      </nav>

      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {currentView === 'login' && (
          <div style={{ ...cardStyle, maxWidth: '450px', margin: '80px auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '30px', color: theme.text }}>Welcome to VoltGrid</h2>
            <form onSubmit={handleLogin}>
              <select onChange={(e) => setUserRole(e.target.value)} style={inputStyle}>
                <option value="user">Standard User</option>
                <option value="admin">System Admin</option>
              </select>
              <input type="text" placeholder={userRole === 'admin' ? "Admin ID" : "Username"} onChange={(e) => setLoginCreds({...loginCreds, id: e.target.value})} required style={inputStyle} />
              {userRole === 'admin' && (
                <input type="password" placeholder="Password" onChange={(e) => setLoginCreds({...loginCreds, password: e.target.value})} required style={inputStyle} />
              )}
              <button type="submit" style={{ background: theme.accent, color: '#FFFFFF', padding: '16px', width: '100%', borderRadius: '8px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', border: 'none', transition: 'all 0.3s' }}>
                {userRole === 'admin' ? 'Access Control Panel' : 'Find Stations'}
              </button>
            </form>
          </div>
        )}

        {currentView === 'admin' && (
          <div>
            <h2 style={{ fontSize: '32px', marginBottom: '10px', color: theme.text }}>Admin Control Panel</h2>
            <p style={{ color: theme.subtext, marginBottom: '30px' }}>The system automatically monitors time and updates Billing & Charging status.</p>
            <div style={{ ...cardStyle, overflowX: 'auto', padding: 0 }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: `2px solid ${theme.border}` }}>
                    <th style={{ padding: '16px', color: theme.subtext }}>ID</th>
                    <th style={{ padding: '16px', color: theme.subtext }}>Driver & Vehicle</th>
                    <th style={{ padding: '16px', color: theme.subtext }}>Location</th>
                    <th style={{ padding: '16px', color: theme.subtext }}>Billing Status</th>
                    <th style={{ padding: '16px', color: theme.subtext }}>Live Charging Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adminBookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '16px', fontWeight: 'bold' }}>{b.id}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 'bold' }}>{b.user_name}</div>
                        <div style={{ fontSize: '12px', color: theme.subtext }}>{b.vehicle_number}</div>
                      </td>
                      <td style={{ padding: '16px' }}>{b.station_name}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ padding: '6px 12px', borderRadius: '20px', background: b.payment_status.includes('Paid') ? '#D1FAE5' : '#FEF3C7', color: b.payment_status.includes('Paid') ? '#065F46' : '#92400E', fontSize: '12px', fontWeight: 'bold' }}>
                          {b.payment_status}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ color: b.charging_status.includes('⚡') ? '#D97706' : b.charging_status.includes('✅') ? theme.accent : theme.subtext, fontWeight: 'bold' }}>
                          {b.charging_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {adminBookings.length === 0 && <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: theme.subtext }}>No active bookings.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === 'app' && (
          <div style={{ display: 'flex', gap: '30px', height: '75vh' }}>
            <div style={{ width: '35%', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '10px' }}>
              <select onChange={handleCityChange} style={{ ...inputStyle, background: '#FFFFFF', fontWeight: 'bold' }}>
                <option value="All">All Cities (India)</option>
                <option value="Chennai">Chennai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
              </select>

              {filteredStations.map(station => (
                <div 
                  key={station.id} 
                  onClick={() => { setSelectedStation(station); setMapCenter({lat: station.lat, lng: station.lng}); setMapZoom(15); }} 
                  style={{ ...cardStyle, cursor: 'pointer', border: selectedStation?.id === station.id ? `2px solid ${theme.accent}` : cardStyle.border, transform: selectedStation?.id === station.id ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.2s' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: theme.text }}>{station.name}</h3>
                  <p style={{ color: theme.subtext, margin: 0, fontSize: '14px' }}>{station.city} • Capacity: {station.speed}</p>
                  <div style={{ marginTop: '15px' }}>
                    <span style={{ color: station.slots > 0 ? '#065F46' : '#991B1B', fontWeight: 'bold', background: station.slots > 0 ? '#D1FAE5' : '#FEE2E2', padding: '5px 10px', borderRadius: '6px', fontSize: '13px' }}>
                      {station.slots > 0 ? `${station.slots} Slots Open` : 'Station Full'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ width: '65%', ...cardStyle, padding: '0', overflow: 'hidden', position: 'relative' }}>
              <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapMover targetLocation={mapCenter} zoom={mapZoom} />
                {filteredStations.map(station => (
                  <Marker key={station.id} position={[station.lat, station.lng]}>
                    <Popup>{station.name} - {station.speed}</Popup>
                  </Marker>
                ))}
              </MapContainer>

              {selectedStation && (
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '20px', color: theme.text }}>{selectedStation.name}</h3>
                    <p style={{ margin: '5px 0 0 0', color: theme.subtext }}>Distance calculated. Ready to charge.</p>
                  </div>
                  <button onClick={() => setCurrentView('booking')} disabled={selectedStation.slots === 0} style={{ background: selectedStation.slots > 0 ? theme.accent : '#CBD5E1', color: selectedStation.slots > 0 ? '#FFFFFF' : '#64748B', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: selectedStation.slots > 0 ? 'pointer' : 'not-allowed', fontSize: '16px' }}>
                    Book Time Slot
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'booking' && (
          <div style={{ ...cardStyle, maxWidth: '600px', margin: '40px auto' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '5px' }}>Schedule Charge</h2>
            <p style={{ color: theme.subtext, marginBottom: '25px' }}>Location: <strong>{selectedStation.name}</strong></p>
            
            <label style={{ color: theme.text, fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Vehicle Number Plate</label>
            <input type="text" placeholder="e.g. TN-01-AB-1234" onChange={(e) => setBookingDetails({...bookingDetails, vehicleNumber: e.target.value})} style={{...inputStyle, textTransform: 'uppercase'}} />

            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: theme.text, fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Select Date</label>
                <input type="date" onChange={(e) => setBookingDetails({...bookingDetails, date: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: theme.text, fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Select Arrival Time</label>
                <input type="time" onChange={(e) => setBookingDetails({...bookingDetails, time: e.target.value})} style={inputStyle} />
              </div>
            </div>
            
            <h3 style={{ margin: '15px 0 10px 0', color: theme.text }}>Payment Method</h3>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
              <button onClick={() => setPaymentMethod('UPI')} style={{ flex: 1, padding: '15px', background: paymentMethod === 'UPI' ? '#E0F2FE' : '#FFFFFF', color: paymentMethod === 'UPI' ? '#0284C7' : theme.text, border: `2px solid ${paymentMethod === 'UPI' ? '#0284C7' : theme.border}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>Pay Now (UPI)</button>
              <button onClick={() => setPaymentMethod('Cash')} style={{ flex: 1, padding: '15px', background: paymentMethod === 'Cash' ? '#D1FAE5' : '#FFFFFF', color: paymentMethod === 'Cash' ? '#065F46' : theme.text, border: `2px solid ${paymentMethod === 'Cash' ? theme.accent : theme.border}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>Pay at Station</button>
            </div>

            {paymentMethod === 'UPI' && (
              <div style={{ textAlign: 'center', marginBottom: '30px', padding: '20px', background: '#F8FAFC', border: `1px solid ${theme.border}`, borderRadius: '12px' }}>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=voltgrid@bank&pn=VoltGrid&am=450" alt="UPI QR" style={{ width: '150px', height: '150px' }}/>
                <p style={{ color: theme.text, marginTop: '15px', fontWeight: 'bold', fontSize: '18px' }}>Scan to pay ₹450</p>
              </div>
            )}

            <button onClick={processPayment} disabled={!paymentMethod || !bookingDetails.date || !bookingDetails.time || !bookingDetails.vehicleNumber} style={{ background: (paymentMethod && bookingDetails.date && bookingDetails.vehicleNumber) ? theme.accent : '#CBD5E1', color: '#FFFFFF', padding: '18px', width: '100%', borderRadius: '8px', fontWeight: 'bold', fontSize: '18px', border: 'none', cursor: paymentMethod ? 'pointer' : 'not-allowed' }}>
              Confirm Reservation
            </button>
          </div>
        )}

        {currentView === 'receipt' && receiptData && (
          <div style={{ ...cardStyle, maxWidth: '500px', margin: '40px auto', textAlign: 'center', borderTop: `8px solid ${theme.accent}` }}>
            <div style={{ fontSize: '50px', margin: '0 0 10px 0' }}>✅</div>
            <h2 style={{ fontSize: '28px', color: theme.text, margin: '0 0 25px 0' }}>Reservation Secured</h2>
            
            <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '12px', textAlign: 'left', marginBottom: '30px', border: `1px solid ${theme.border}` }}>
              <p style={{ color: theme.subtext, margin: '0 0 12px 0' }}>ID: <strong style={{ color: theme.text, float: 'right' }}>{receiptData.id}</strong></p>
              <p style={{ color: theme.subtext, margin: '0 0 12px 0' }}>Driver: <strong style={{ color: theme.text, float: 'right' }}>{receiptData.user_name}</strong></p>
              <p style={{ color: theme.subtext, margin: '0 0 12px 0' }}>Vehicle: <strong style={{ color: theme.text, float: 'right' }}>{receiptData.vehicle_number}</strong></p>
              <p style={{ color: theme.subtext, margin: '0 0 12px 0' }}>Hub: <strong style={{ color: theme.text, float: 'right' }}>{receiptData.station_name}</strong></p>
              <p style={{ color: theme.subtext, margin: '0 0 12px 0' }}>Schedule: <strong style={{ color: theme.text, float: 'right' }}>{receiptData.date} @ {receiptData.time}</strong></p>
              <p style={{ color: theme.subtext, margin: 0 }}>Payment: <strong style={{ color: theme.accent, float: 'right' }}>{receiptData.payment_status} ({receiptData.payment_method})</strong></p>
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={downloadReceipt} style={{ flex: 1, background: '#0F172A', color: '#FFFFFF', padding: '16px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Download Receipt</button>
              <button onClick={() => setCurrentView('app')} style={{ flex: 1, background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', padding: '16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Return to Map</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;