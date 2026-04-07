import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import './App.css';

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
  
  // ADDED NEW STATE VARIABLES FOR HOURS, MINUTES, AND VEHICLE TYPE
  const [bookingDetails, setBookingDetails] = useState({ 
    date: '', 
    timeHour: '12', 
    timeMinute: '00', 
    vehicleNumber: '',
    vehicleType: 'Car' 
  });
  
  const [receiptData, setReceiptData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [adminBookings, setAdminBookings] = useState([]);

  const fetchStations = () => fetch('https://voltgrid-api.onrender.com/api/stations').then(res => res.json()).then(setStations);
  const fetchAdminBookings = () => fetch('https://voltgrid-api.onrender.com/api/admin/bookings').then(res => res.json()).then(setAdminBookings);

  useEffect(() => {
    if (currentView === 'app') fetchStations();
    if (currentView === 'admin' || currentView === 'staff') {
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
    } else if (userRole === 'staff') {
      if (loginCreds.id === 'staff' && loginCreds.password === '123') setCurrentView('staff');
      else alert("Incorrect Staff Credentials!");
    } else {
      setCurrentView('app');
    }
  };

  const updateStaffStatus = async (bookingId, newCharge, newPayment) => {
    await fetch(`https://voltgrid-api.onrender.com/api/staff/update/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ charging_status: newCharge, payment_status: newPayment })
    });
    fetchAdminBookings();
  };

  const handleDispatch = async (bookingId) => {
    await fetch(`https://voltgrid-api.onrender.com/api/staff/dispatch/${bookingId}`, { method: 'PUT' });
    fetchAdminBookings();
  };

  const handleCityChange = (city) => {
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
    const combinedTime = `${bookingDetails.timeHour}:${bookingDetails.timeMinute}`;
    const response = await fetch('https://voltgrid-api.onrender.com/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        station_id: selectedStation.id,
        user_name: loginCreds.id || 'EV User',
        vehicle_type: bookingDetails.vehicleType,
        vehicle_number: bookingDetails.vehicleNumber.toUpperCase(),
        date: bookingDetails.date,
        time: combinedTime,
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
    const receiptText = `VOLTGRID EV CHARGING RECEIPT\n------------------------------\nBooking ID: ${receiptData.id}\nDriver Name: ${receiptData.user_name}\nVehicle Type: ${receiptData.vehicle_type}\nVehicle Reg: ${receiptData.vehicle_number}\nLocation: ${receiptData.station_name}\nDate & Time: ${receiptData.date} @ ${receiptData.time}\nPayment Method: ${receiptData.payment_method}\nAmount: Rs. 450\n------------------------------\nThank you for using VoltGrid.`;
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `VoltGrid_Receipt_${receiptData.id}.txt`;
    link.click();
  };

  const filteredStations = cityFilter === 'All' ? stations : stations.filter(s => s.city === cityFilter);

  const theme = { bg: '#F8FAFC', panel: '#FFFFFF', accent: '#0F172A', text: '#0F172A', subtext: '#64748B', border: '#E2E8F0', success: '#10B981' };
  const cardStyle = { background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' };
  const inputStyle = { width: '100%', padding: '14px', marginBottom: '20px', borderRadius: '8px', background: '#F1F5F9', border: `1px solid ${theme.border}`, color: theme.text, fontSize: '16px', boxSizing: 'border-box', outlineColor: theme.accent };

  // Helper arrays for time dropdowns
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, minHeight: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 40px', background: '#FFFFFF', borderBottom: `1px solid ${theme.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: theme.accent, fontSize: '24px', fontWeight: '900', margin: 0, letterSpacing: '1px' }}>VOLTGRID</h1>
        {currentView !== 'login' && (
          <button onClick={() => setCurrentView('login')} style={{ background: '#F1F5F9', color: theme.text, border: `1px solid ${theme.border}`, padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Sign Out</button>
        )}
      </nav>

      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {currentView === 'login' && (
          <div style={{ ...cardStyle, maxWidth: '450px', margin: '80px auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '30px', color: theme.text, fontWeight: '800' }}>Platform Access</h2>
            
            <div style={{ display: 'flex', gap: '5px', background: '#F1F5F9', padding: '6px', borderRadius: '10px', marginBottom: '20px' }}>
              <button onClick={(e) => { e.preventDefault(); setUserRole('user'); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', background: userRole === 'user' ? '#FFFFFF' : 'transparent', color: userRole === 'user' ? '#0F172A' : '#64748B', boxShadow: userRole === 'user' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', fontSize: '13px' }}>User</button>
              <button onClick={(e) => { e.preventDefault(); setUserRole('staff'); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', background: userRole === 'staff' ? '#FFFFFF' : 'transparent', color: userRole === 'staff' ? '#0F172A' : '#64748B', boxShadow: userRole === 'staff' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', fontSize: '13px' }}>Attendant</button>
              <button onClick={(e) => { e.preventDefault(); setUserRole('admin'); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', background: userRole === 'admin' ? '#FFFFFF' : 'transparent', color: userRole === 'admin' ? '#0F172A' : '#64748B', boxShadow: userRole === 'admin' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', fontSize: '13px' }}>Admin</button>
            </div>

            <form onSubmit={handleLogin}>
              <input type="text" placeholder={userRole === 'user' ? "Username" : "Employee/Admin ID"} onChange={(e) => setLoginCreds({...loginCreds, id: e.target.value})} required style={inputStyle} />
              {userRole !== 'user' && (
                <input type="password" placeholder="Password" onChange={(e) => setLoginCreds({...loginCreds, password: e.target.value})} required style={inputStyle} />
              )}
              <button type="submit" style={{ background: theme.accent, color: '#FFFFFF', padding: '16px', width: '100%', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', border: 'none', transition: 'all 0.3s' }}>Secure Login</button>
            </form>
          </div>
        )}

        {currentView === 'staff' && (
          <div>
            <h2 style={{ fontSize: '28px', marginBottom: '10px', color: theme.text, fontWeight: '800' }}>Station Attendant Portal</h2>
            <p style={{ color: theme.subtext, marginBottom: '30px' }}>Log incoming vehicles, update charge/billing status, and clear bays upon departure.</p>
            <div style={{ ...cardStyle, overflowX: 'auto', padding: 0 }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: `2px solid ${theme.border}` }}>
                    <th style={{ padding: '16px', color: theme.subtext, fontSize: '14px' }}>Vehicle</th>
                    <th style={{ padding: '16px', color: theme.subtext, fontSize: '14px' }}>Location</th>
                    <th style={{ padding: '16px', color: theme.subtext, fontSize: '14px' }}>Update Statuses</th>
                    <th style={{ padding: '16px', color: theme.subtext, fontSize: '14px' }}>Manual Dispatch</th>
                  </tr>
                </thead>
                <tbody>
                  {adminBookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{b.vehicle_number}</div>
                        <div style={{ color: theme.subtext, fontSize: '12px' }}>{b.vehicle_type}</div>
                      </td>
                      <td style={{ padding: '16px', color: theme.subtext, fontSize: '14px' }}>{b.station_name}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <select 
                            value={b.charging_status} 
                            onChange={(e) => updateStaffStatus(b.id, e.target.value, b.payment_status)}
                            style={{ padding: '8px', borderRadius: '4px', border: `1px solid ${theme.border}`, fontSize: '12px', fontWeight: 'bold' }}>
                            <option value="Arriving...">Arriving...</option>
                            <option value="⚡ Charging">⚡ Charging</option>
                            <option value="✅ Completed">✅ Completed</option>
                          </select>
                          <select 
                            value={b.payment_status} 
                            onChange={(e) => updateStaffStatus(b.id, b.charging_status, e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px', border: `1px solid ${theme.border}`, fontSize: '12px', fontWeight: 'bold' }}>
                            <option value="Pending (Cash)">Pending (Cash)</option>
                            <option value="Paid (Cash Collected)">Paid (Cash Collected)</option>
                            <option value="Paid (UPI)" disabled>Paid (UPI)</option>
                          </select>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {b.charging_status.includes('Completed') && b.payment_status.includes('Paid') && !b.verification_status.includes('Verified') ? (
                          <button onClick={() => handleDispatch(b.id)} style={{ background: theme.success, color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(16,185,129,0.3)' }}>
                            Clear Vehicle from Bay
                          </button>
                        ) : (
                          <span style={{ color: b.verification_status.includes('Verified') ? theme.success : theme.subtext, fontWeight: 'bold', fontSize: '14px' }}>
                            {b.verification_status.includes('Verified') ? 'Dispatched' : 'Finish Charge & Payment to Dispatch'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {adminBookings.length === 0 && <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: theme.subtext }}>No vehicles in bays.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === 'admin' && (
          <div>
            <h2 style={{ fontSize: '28px', marginBottom: '10px', color: theme.text, fontWeight: '800' }}>Admin Command Center</h2>
            <p style={{ color: theme.subtext, marginBottom: '30px' }}>Global ledger. Watching live telemetry pushed by Station Attendants.</p>
            <div style={{ ...cardStyle, overflowX: 'auto', padding: 0 }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: `2px solid ${theme.border}` }}>
                    <th style={{ padding: '16px', color: theme.subtext, fontSize: '14px' }}>Transaction ID</th>
                    <th style={{ padding: '16px', color: theme.subtext, fontSize: '14px' }}>Driver & Vehicle</th>
                    <th style={{ padding: '16px', color: theme.subtext, fontSize: '14px' }}>Station Location</th>
                    <th style={{ padding: '16px', color: theme.subtext, fontSize: '14px' }}>Live Staff Telemetry</th>
                    <th style={{ padding: '16px', color: theme.subtext, fontSize: '14px' }}>Physical Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {adminBookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '16px', fontWeight: 'bold' }}>{b.id}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 'bold' }}>{b.user_name}</div>
                        <div style={{ fontSize: '12px', color: theme.subtext }}>{b.vehicle_number} ({b.vehicle_type})</div>
                      </td>
                      <td style={{ padding: '16px' }}>{b.station_name}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '12px', marginBottom: '4px' }}><strong style={{color: theme.subtext}}>Charge:</strong> {b.charging_status}</div>
                        <div style={{ fontSize: '12px' }}><strong style={{color: theme.subtext}}>Bill:</strong> {b.payment_status}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ padding: '6px 12px', borderRadius: '4px', background: b.verification_status.includes('Verified') ? '#D1FAE5' : '#FEF3C7', color: theme.text, fontSize: '12px', fontWeight: 'bold', border: `1px solid ${theme.border}` }}>
                          {b.verification_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {adminBookings.length === 0 && <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: theme.subtext }}>No active telemetries.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === 'app' && (
          <div style={{ display: 'flex', gap: '30px', height: '75vh' }}>
            <div style={{ width: '35%', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '10px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', background: theme.panel, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                {['All', 'Chennai', 'Bangalore', 'Hyderabad', 'Mumbai', 'Delhi'].map(city => (
                  <button 
                    key={city} onClick={() => handleCityChange(city)}
                    style={{ flex: '1 1 calc(33% - 8px)', padding: '8px', background: cityFilter === city ? theme.accent : '#F1F5F9', color: cityFilter === city ? '#FFFFFF' : theme.subtext, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                    {city === 'All' ? 'India' : city}
                  </button>
                ))}
              </div>

              {filteredStations.map(station => (
                <div 
                  key={station.id} onClick={() => { setSelectedStation(station); setMapCenter({lat: station.lat, lng: station.lng}); setMapZoom(15); }} 
                  style={{ ...cardStyle, cursor: 'pointer', border: selectedStation?.id === station.id ? `2px solid ${theme.accent}` : cardStyle.border, transform: selectedStation?.id === station.id ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.2s' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: theme.text }}>{station.name}</h3>
                  <p style={{ color: theme.subtext, margin: 0, fontSize: '14px' }}>{station.city} • Capacity: {station.speed}</p>
                  <div style={{ marginTop: '15px' }}>
                    <span style={{ color: station.slots > 0 ? theme.text : '#991B1B', fontWeight: 'bold', background: station.slots > 0 ? '#F1F5F9' : '#FEE2E2', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' }}>
                      {station.slots > 0 ? `${station.slots} Slots Available` : 'Station Fully Booked'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ width: '65%', ...cardStyle, padding: '0', overflow: 'hidden', position: 'relative' }}>
              <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
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
                    <p style={{ margin: '5px 0 0 0', color: theme.subtext }}>Location pinned. System ready for reservation.</p>
                  </div>
                  <button onClick={() => setCurrentView('booking')} disabled={selectedStation.slots === 0} style={{ background: selectedStation.slots > 0 ? theme.accent : '#CBD5E1', color: '#FFFFFF', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: selectedStation.slots > 0 ? 'pointer' : 'not-allowed', fontSize: '14px' }}>
                    Initiate Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'booking' && (
          <div style={{ ...cardStyle, maxWidth: '600px', margin: '40px auto' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '5px', fontWeight: '800' }}>Reservation Setup</h2>
            <p style={{ color: theme.subtext, marginBottom: '25px' }}>Terminal: <strong>{selectedStation.name}</strong></p>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '5px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: theme.text, fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Vehicle Type</label>
                <select onChange={(e) => setBookingDetails({...bookingDetails, vehicleType: e.target.value})} style={inputStyle}>
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                  <option value="Auto">Auto (Rickshaw)</option>
                </select>
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ color: theme.text, fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Vehicle Registration Plate</label>
                <input type="text" placeholder="e.g. TN-01-AB-1234" onChange={(e) => setBookingDetails({...bookingDetails, vehicleNumber: e.target.value})} style={{...inputStyle, textTransform: 'uppercase'}} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 2 }}>
                <label style={{ color: theme.text, fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Arrival Date</label>
                <input type="date" onChange={(e) => setBookingDetails({...bookingDetails, date: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: theme.text, fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Hours</label>
                <select onChange={(e) => setBookingDetails({...bookingDetails, timeHour: e.target.value})} style={inputStyle}>
                  {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: theme.text, fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Minutes</label>
                <select onChange={(e) => setBookingDetails({...bookingDetails, timeMinute: e.target.value})} style={inputStyle}>
                  {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            
            <h3 style={{ margin: '15px 0 10px 0', color: theme.text, fontSize: '16px' }}>Payment Authorization</h3>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
              <button onClick={() => setPaymentMethod('UPI')} style={{ flex: 1, padding: '15px', background: paymentMethod === 'UPI' ? theme.accent : '#F8FAFC', color: paymentMethod === 'UPI' ? '#FFFFFF' : theme.text, border: `1px solid ${paymentMethod === 'UPI' ? theme.accent : theme.border}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>Digital UPI</button>
              <button onClick={() => setPaymentMethod('Cash')} style={{ flex: 1, padding: '15px', background: paymentMethod === 'Cash' ? theme.accent : '#F8FAFC', color: paymentMethod === 'Cash' ? '#FFFFFF' : theme.text, border: `1px solid ${paymentMethod === 'Cash' ? theme.accent : theme.border}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>Pay at Terminal</button>
            </div>

            {paymentMethod === 'UPI' && (
              <div style={{ textAlign: 'center', marginBottom: '30px', padding: '20px', background: '#F8FAFC', border: `1px solid ${theme.border}`, borderRadius: '12px' }}>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=voltgrid@bank&pn=VoltGrid&am=450" alt="UPI QR" style={{ width: '150px', height: '150px' }}/>
                <p style={{ color: theme.text, marginTop: '15px', fontWeight: 'bold', fontSize: '14px' }}>Scan to authorize Rs. 450</p>
              </div>
            )}

            <button onClick={processPayment} disabled={!paymentMethod || !bookingDetails.date || !bookingDetails.vehicleNumber} style={{ background: (paymentMethod && bookingDetails.date && bookingDetails.vehicleNumber) ? theme.accent : '#CBD5E1', color: '#FFFFFF', padding: '18px', width: '100%', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: paymentMethod ? 'pointer' : 'not-allowed' }}>
              Confirm & Generate Receipt
            </button>
          </div>
        )}

        {currentView === 'receipt' && receiptData && (
          <div style={{ ...cardStyle, maxWidth: '500px', margin: '40px auto', textAlign: 'center', borderTop: `6px solid ${theme.accent}` }}>
            <h2 style={{ fontSize: '28px', color: theme.text, margin: '0 0 25px 0', fontWeight: '800' }}>Transaction Complete</h2>
            
            <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '12px', textAlign: 'left', marginBottom: '30px', border: `1px solid ${theme.border}` }}>
              <p style={{ color: theme.subtext, margin: '0 0 12px 0', fontSize: '14px' }}>Receipt ID: <strong style={{ color: theme.text, float: 'right' }}>{receiptData.id}</strong></p>
              <p style={{ color: theme.subtext, margin: '0 0 12px 0', fontSize: '14px' }}>Driver Name: <strong style={{ color: theme.text, float: 'right' }}>{receiptData.user_name}</strong></p>
              <p style={{ color: theme.subtext, margin: '0 0 12px 0', fontSize: '14px' }}>Vehicle: <strong style={{ color: theme.text, float: 'right' }}>{receiptData.vehicle_type} ({receiptData.vehicle_number})</strong></p>
              <p style={{ color: theme.subtext, margin: '0 0 12px 0', fontSize: '14px' }}>Terminal Hub: <strong style={{ color: theme.text, float: 'right' }}>{receiptData.station_name}</strong></p>
              <p style={{ color: theme.subtext, margin: '0 0 12px 0', fontSize: '14px' }}>Scheduled: <strong style={{ color: theme.text, float: 'right' }}>{receiptData.date} @ {receiptData.time}</strong></p>
              <p style={{ color: theme.subtext, margin: 0, fontSize: '14px' }}>Authorization: <strong style={{ color: theme.text, float: 'right' }}>{receiptData.payment_status} ({receiptData.payment_method})</strong></p>
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={downloadReceipt} style={{ flex: 1, background: theme.accent, color: '#FFFFFF', padding: '16px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Download Record</button>
              <button onClick={() => setCurrentView('app')} style={{ flex: 1, background: '#FFFFFF', color: theme.text, border: `1px solid ${theme.border}`, padding: '16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Return to Dashboard</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;