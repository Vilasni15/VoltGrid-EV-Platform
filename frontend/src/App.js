import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// FIX MARKER ISSUE
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const API = "http://localhost:8000";

const cities = {
  Chennai: [13.0827, 80.2707],
  Bangalore: [12.9716, 77.5946],
  Mumbai: [19.0760, 72.8777],
  Delhi: [28.7041, 77.1025],
  Hyderabad: [17.3850, 78.4867]
};

// Real-world coordinates for exact map placements
const places = {
  Chennai: [
    { name: "T Nagar", coords: [13.0418, 80.2341] },
    { name: "Guindy", coords: [13.0067, 80.2206] },
    { name: "Adyar", coords: [13.0012, 80.2565] },
    { name: "Velachery", coords: [12.9774, 80.2231] },
    { name: "Anna Nagar", coords: [13.0850, 80.2101] },
    { name: "OMR", coords: [12.9191, 80.2300] },
    { name: "Tambaram", coords: [12.9249, 80.1000] },
    { name: "Egmore", coords: [13.0732, 80.2609] }
  ],
  Bangalore: [
    { name: "Indiranagar", coords: [12.9784, 77.6408] },
    { name: "Whitefield", coords: [12.9698, 77.7499] },
    { name: "BTM", coords: [12.9166, 77.6101] },
    { name: "Electronic City", coords: [12.8452, 77.6602] },
    { name: "Yelahanka", coords: [13.1007, 77.5963] },
    { name: "MG Road", coords: [12.9719, 77.6013] },
    { name: "Hebbal", coords: [13.0354, 77.5988] },
    { name: "Jayanagar", coords: [12.9299, 77.5826] }
  ],
  Mumbai: [
    { name: "Andheri", coords: [19.1136, 72.8697] },
    { name: "Bandra", coords: [19.0596, 72.8295] },
    { name: "Powai", coords: [19.1176, 72.9060] },
    { name: "Worli", coords: [19.0169, 72.8197] },
    { name: "Dadar", coords: [19.0178, 72.8478] },
    { name: "Colaba", coords: [18.9067, 72.8147] },
    { name: "Thane", coords: [19.2183, 72.9781] },
    { name: "Borivali", coords: [19.2307, 72.8567] }
  ],
  Delhi: [
    { name: "CP", coords: [28.6304, 77.2177] },
    { name: "Saket", coords: [28.5246, 77.2066] },
    { name: "Dwarka", coords: [28.5823, 77.0500] },
    { name: "Rohini", coords: [28.7366, 77.1132] },
    { name: "Karol Bagh", coords: [28.6514, 77.1907] },
    { name: "Lajpat", coords: [28.5677, 77.2433] },
    { name: "Noida", coords: [28.5355, 77.3910] },
    { name: "Gurgaon", coords: [28.4595, 77.0266] }
  ],
  Hyderabad: [
    { name: "Hitech", coords: [17.4435, 78.3772] },
    { name: "Gachibowli", coords: [17.4401, 78.3489] },
    { name: "Banjara", coords: [17.4156, 78.4347] },
    { name: "Jubilee", coords: [17.4313, 78.4071] },
    { name: "Madhapur", coords: [17.4483, 78.3915] },
    { name: "Kukatpally", coords: [17.4849, 78.4138] },
    { name: "Secunderabad", coords: [17.4399, 78.4983] },
    { name: "Begumpet", coords: [17.4453, 78.4611] }
  ]
};

const getSlots = (placeName) => (placeName.charCodeAt(0) + placeName.length) % 5 + 2;

// Handles smooth flying and zooming
function FlyMap({ coords, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(coords, zoom, {
      animate: true,
      duration: 1.5
    });
  }, [coords, zoom, map]);
  return null;
}

function App(){

// STATES
const [page,setPage]=useState("landing");
const [role,setRole]=useState("User");
const [authView, setAuthView] = useState("select"); 
const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

const [username,setUsername]=useState("");
const [email,setEmail]=useState("");
const [password,setPassword]=useState("");
const [confirm,setConfirm]=useState("");

const [loginUser,setLoginUser]=useState("");
const [loginPass,setLoginPass]=useState("");

const [city,setCity]=useState("Chennai");
const [coords,setCoords]=useState(cities["Chennai"]);
const [mapZoom, setMapZoom] = useState(11); 
const [place,setPlace]=useState("");

const [vehicle,setVehicle]=useState("");
const [type,setType]=useState("Car");
const [date,setDate]=useState("");
const [time,setTime]=useState("");
const [payment,setPayment]=useState("");

const [message,setMessage]=useState("");
const [data,setData]=useState([]);
const [showModal, setShowModal] = useState(false);

// Ref to store map markers to trigger popups programmatically
const markerRefs = useRef([]);

// RESET
const resetAll = () => {
  setUsername(""); setEmail(""); setPassword(""); setConfirm("");
  setLoginUser(""); setLoginPass(""); setMessage("");
  setAuthView("select"); 
};

// LIVE DATA
useEffect(()=>{
 if(page==="dashboard"){
  const i=setInterval(async()=>{
    const r=await fetch(API+"/data");
    const d=await r.json();
    setData(d);
  },2000);
  return()=>clearInterval(i);
 }
},[page]);

// LOGIN
const login=async()=>{
 const r=await fetch(API+"/login",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({username:loginUser,password:loginPass,role})
 });
 const d=await r.json();
 if(!d.ok) return setMessage("Wrong credentials");
 setPage(role==="User"?"map":"dashboard");
};

// SIGNUP
const signup=async()=>{
 if(password!==confirm) return setMessage("Password mismatch");

 await fetch(API+"/signup",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({username,email,password,confirm})
 });

 setMessage("Signup successful");
 setPage("map");
};

// BOOK
const book=async()=>{
 if(!vehicle||!date||!time||!place)
  return setMessage("Fill all fields");

 await fetch(API+"/book",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({
    user:loginUser,
    vehicle_type:type,
    vehicle,
    station:place,
    date,
    time,
    payment
  })
 });

 setShowModal(true);
};

// DOWNLOAD RECEIPT
const downloadReceipt = () => {
  const receiptText = `
=========================================
      VOLTGRID BOOKING RECEIPT
=========================================

User Details:
-------------
Username  : ${loginUser || "Guest"}
Vehicle   : ${type} (${vehicle})

Charging Details:
-----------------
Station   : ${place}, ${city}
Date      : ${date}
Time      : ${time}

Payment Status:
---------------
Method    : ${payment || "Not Selected"}
Status    : ${payment === "UPI" ? "PAID" : "PENDING (Pay at Station)"}

=========================================
Thank you for powering up with VoltGrid.
=========================================
  `;
  const blob = new Blob([receiptText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `VoltGrid_Receipt_${place}.txt`;
  link.click();
};

// UPDATE
const updateStatus=async(id,charging,payment)=>{
 await fetch(API+"/update",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({id,charging,payment})
 });
};

// BLOCK
const blockUser=async(user)=>{
 await fetch(API+"/block",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({user})
 });
 alert("User Blocked");
};


// =========================================================
// UI
// =========================================================

// LANDING
if(page==="landing"){
 return(
  <div className="landing">
    <div className="ambient-orb orb-1"></div>
    <div className="ambient-orb orb-2"></div>
    
    <div className="overlay glass-panel glass-hero">
      <div className="landing-text">
        <div className="hero-badge">Next-Gen Charging</div>
        <h1>VoltGrid</h1>
        <p>The smartest, fastest way to power your journey. Book seamlessly, charge instantly.</p>
        <button className="btn-glow" onClick={()=>setPage("auth")}>
          <span>Start Charging</span>
        </button>
      </div>
    </div>
  </div>
 );
}

// AUTH
if(page==="auth"){
 return(
  <div className="auth">
    <div className="auth-header">
      <h2>Welcome to VoltGrid</h2>
      
      <div className="custom-dropdown-wrapper">
        <div 
          className="premium-select custom-select-header" 
          onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
        >
          {role}
        </div>
        
        {roleDropdownOpen && (
          <div className="custom-options-list glass-panel">
            {["User", "Attendant", "Admin"].map((r) => (
              <div 
                key={r} 
                className="custom-option"
                onClick={() => {
                  setRole(r);
                  resetAll();
                  setRoleDropdownOpen(false);
                }}
              >
                {r}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    <div className="auth-body">
      {role === "User" && authView === "select" && (
        <div className="auth-card text-center">
          <h3>Let's get started</h3>
          <p className="subtitle">Do you want to sign in or create an account?</p>
          <button onClick={() => setAuthView("login")}>Log In</button>
          <button className="btn-secondary" onClick={() => setAuthView("signup")}>Sign Up</button>
        </div>
      )}

      {role === "User" && authView === "signup" && (
        <div className="auth-card">
          <h3>Create Account</h3>
          <input value={username} placeholder="Username" onChange={e=>setUsername(e.target.value)}/>
          <input value={email} placeholder="Email" onChange={e=>setEmail(e.target.value)}/>
          <input type="password" value={password} placeholder="Password" onChange={e=>setPassword(e.target.value)}/>
          <input type="password" value={confirm} placeholder="Confirm" onChange={e=>setConfirm(e.target.value)}/>
          <button onClick={signup}>Sign Up</button>
          <button className="btn-text" onClick={() => setAuthView("select")}>Back to options</button>
        </div>
      )}

      {((role !== "User") || (role === "User" && authView === "login")) && (
        <div className="auth-card">
          <h3>{role} Login</h3>
          <input value={loginUser} placeholder="Username" onChange={e=>setLoginUser(e.target.value)}/>
          <input type="password" value={loginPass} placeholder="Password" onChange={e=>setLoginPass(e.target.value)}/>
          <button onClick={login}>Log In</button>
          <p>{message}</p>
          {role === "User" && <button className="btn-text" onClick={() => setAuthView("select")}>Back to options</button>}
        </div>
      )}
    </div>

    <button className="btn-text" onClick={()=>setPage("landing")}>Back to Home</button>
  </div>
 );
}

// MAP
if(page==="map"){
 return(
  <div className="layout">
    <div className="sidebar">
      <h3>Cities</h3>
      {Object.keys(cities).map(c=>
        <button key={c} onClick={()=>{
          setCity(c);
          setCoords(cities[c]);
          setMapZoom(11); 
        }}>{c}</button>
      )}

      <h3>Stations in {city}</h3>
      {places[city].map((location, i)=> {
        return (
          <div key={location.name} className="card glass-item" onClick={()=>{
            setCoords(location.coords);
            setMapZoom(15);
            // Automatically open the popup for this exact marker
            if (markerRefs.current[i]) {
              markerRefs.current[i].openPopup();
            }
          }}>
            <span className="station-name">{location.name}</span>
            <span className="slots-badge">{getSlots(location.name)} slots</span>
          </div>
        );
      })}

      <button className="btn-logout" onClick={()=>setPage("auth")}>Logout</button>
    </div>

    <MapContainer center={coords} zoom={mapZoom} className="map" style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"/>
      
      <FlyMap coords={coords} zoom={mapZoom} />

      {places[city].map((location, i) => {
        return (
          <Marker 
            key={location.name} 
            position={location.coords}
            ref={(ref) => { markerRefs.current[i] = ref; }}
            eventHandlers={{
              click: () => {
                setCoords(location.coords);
                setMapZoom(15); 
              }
            }}
          >
            <Popup>
              <div className="map-popup">
                <h4>{location.name} Station</h4>
                <p className="slots-info">{getSlots(location.name)} Slots Available</p>
                <button className="btn-glow btn-sm" onClick={() => {
                  setPlace(location.name);
                  setPage("booking");
                }}>
                  Book Now
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  </div>
 );
}

// BOOKING
if(page==="booking"){
 return(
  <div className="booking">
    
    <div className="booking-card">
      <h2>{place} Station</h2>

      <div className="booking-grid">
        <select onChange={e=>setType(e.target.value)}>
          <option>Car</option>
          <option>Bike</option>
          <option>Auto</option>
        </select>
        <input placeholder="Vehicle No." onChange={e=>setVehicle(e.target.value)}/>
        <input type="date" onChange={e=>setDate(e.target.value)}/>
        <input type="time" onChange={e=>setTime(e.target.value)}/>
      </div>

      <div className="btn-row">
        <button className={payment === "UPI" ? "active-pay" : "outline-pay"} onClick={()=>setPayment("UPI")}>UPI</button>
        <button className={payment === "Cash" ? "active-pay" : "outline-pay"} onClick={()=>{setPayment("Cash");setMessage("Pay at station");}}>
          Cash
        </button>
      </div>

      {payment==="UPI" &&
        <div className="qr-container">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay" alt="QR"/>
        </div>
      }

      <button className="btn-glow" onClick={book}>Confirm Booking</button>
      <p>{message}</p>
    </div>

    <button className="btn-text" onClick={()=>setPage("map")}>Go Back</button>

    {showModal && (
      <div className="modal-overlay">
        <div className="modal-content glass-panel">
          <h3>Booking Confirmed</h3>
          <p>Your slot at <b>{place}</b> has been successfully reserved.</p>
          <p className="status-text">Payment Status: <b>{payment === "UPI" ? "Paid via UPI" : "Pending (Pay at Station)"}</b></p>
          
          <div className="modal-actions">
            <button className="btn-download" onClick={downloadReceipt}>Download Receipt</button>
            <button className="btn-secondary" onClick={() => { setShowModal(false); setPage("map"); }}>Back to Map</button>
          </div>
        </div>
      </div>
    )}

  </div>
 );
}

// DASHBOARD
if(page==="dashboard"){
 return(
  <div className="dashboard">
    <h2>{role} Dashboard</h2>
    
    <div className="dashboard-grid">
     {data.map(d=>
      <div key={d.id} className="card glass-item">
        <div className="card-header">
          <h3>{d.user ? d.user : "No User Found"}</h3>
          <span className="badge station">{d.station}</span>
        </div>

        <div className="card-body">
          <p><b>Vehicle:</b> {d.vehicle_type} - {d.vehicle}</p>
          <p><b>Date:</b> {d.date}</p>
          <p><b>Time:</b> {d.time}</p>
        </div>

        <div className="card-status">
          <span className={`badge payment ${d.payment === "Paid" ? "paid" : "pending"}`}>
            {d.payment}
          </span>
          <span className={`badge charging ${d.charging === "Completed" ? "done" : "progress"}`}>
            {d.charging}
          </span>
        </div>

        <div className="card-actions">
          {role==="Attendant" && <>
            <button onClick={()=>updateStatus(d.id,"Charging","Paid")}>Start Charging</button>
            <button className="btn-secondary" onClick={()=>updateStatus(d.id,"Completed","Paid")}>Complete</button>
          </>}

          {role==="Admin" && <>
            <button className="btn-danger" onClick={()=>blockUser(d.user)}>Block User</button>
          </>}
        </div>
      </div>
    )}
    </div>

    <button className="btn-logout" onClick={()=>setPage("auth")}>Logout</button>
  </div>
 );
}

return null;
}

export default App;