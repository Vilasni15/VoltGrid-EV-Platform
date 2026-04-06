# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 40 Stations
stations_db = [
    # CHENNAI
    {"id": 1, "name": "T Nagar Hub", "city": "Chennai", "state": "Tamil Nadu", "speed": "150kW", "slots": 4, "lat": 13.0418, "lng": 80.2341},
    {"id": 2, "name": "Guindy Tech Grid", "city": "Chennai", "state": "Tamil Nadu", "speed": "250kW", "slots": 2, "lat": 13.0067, "lng": 80.2206},
    {"id": 3, "name": "Saveetha EcoCharge", "city": "Chennai", "state": "Tamil Nadu", "speed": "100kW", "slots": 5, "lat": 13.0285, "lng": 80.0166},
    {"id": 4, "name": "Marina Beach Plugs", "city": "Chennai", "state": "Tamil Nadu", "speed": "50kW", "slots": 0, "lat": 13.0500, "lng": 80.2824},
    {"id": 5, "name": "Velachery Mall Fast Charge", "city": "Chennai", "state": "Tamil Nadu", "speed": "150kW", "slots": 3, "lat": 12.9815, "lng": 80.2180},
    {"id": 6, "name": "Anna Nagar Supercharger", "city": "Chennai", "state": "Tamil Nadu", "speed": "250kW", "slots": 1, "lat": 13.0850, "lng": 80.2101},
    {"id": 7, "name": "OMR IT Corridor", "city": "Chennai", "state": "Tamil Nadu", "speed": "100kW", "slots": 8, "lat": 12.9010, "lng": 80.2279},
    {"id": 8, "name": "Adyar Fast Grid", "city": "Chennai", "state": "Tamil Nadu", "speed": "150kW", "slots": 4, "lat": 13.0012, "lng": 80.2565},
    # BANGALORE
    {"id": 9, "name": "Koramangala Charge", "city": "Bangalore", "state": "Karnataka", "speed": "150kW", "slots": 4, "lat": 12.9352, "lng": 77.6245},
    {"id": 10, "name": "Indiranagar EV", "city": "Bangalore", "state": "Karnataka", "speed": "250kW", "slots": 0, "lat": 12.9784, "lng": 77.6408},
    {"id": 11, "name": "Whitefield IT Plug", "city": "Bangalore", "state": "Karnataka", "speed": "100kW", "slots": 6, "lat": 12.9698, "lng": 77.7499},
    {"id": 12, "name": "Electronic City Hub", "city": "Bangalore", "state": "Karnataka", "speed": "350kW", "slots": 2, "lat": 12.8452, "lng": 77.6602},
    {"id": 13, "name": "MG Road Central", "city": "Bangalore", "state": "Karnataka", "speed": "150kW", "slots": 1, "lat": 12.9719, "lng": 77.6013},
    {"id": 14, "name": "Jayanagar Eco", "city": "Bangalore", "state": "Karnataka", "speed": "50kW", "slots": 3, "lat": 12.9299, "lng": 77.5834},
    {"id": 15, "name": "Malleshwaram Power", "city": "Bangalore", "state": "Karnataka", "speed": "100kW", "slots": 5, "lat": 13.0031, "lng": 77.5643},
    {"id": 16, "name": "Hebbal FastLink", "city": "Bangalore", "state": "Karnataka", "speed": "250kW", "slots": 4, "lat": 13.0354, "lng": 77.5988},
    # HYDERABAD
    {"id": 17, "name": "HITEC City Supercharge", "city": "Hyderabad", "state": "Telangana", "speed": "250kW", "slots": 4, "lat": 17.4435, "lng": 78.3772},
    {"id": 18, "name": "Banjara Hills Premium", "city": "Hyderabad", "state": "Telangana", "speed": "150kW", "slots": 2, "lat": 17.4156, "lng": 78.4347},
    {"id": 19, "name": "Jubilee Hills Plug", "city": "Hyderabad", "state": "Telangana", "speed": "100kW", "slots": 0, "lat": 17.4326, "lng": 78.4071},
    {"id": 20, "name": "Gachibowli IT Grid", "city": "Hyderabad", "state": "Telangana", "speed": "350kW", "slots": 5, "lat": 17.4401, "lng": 78.3489},
    {"id": 21, "name": "Secunderabad Station", "city": "Hyderabad", "state": "Telangana", "speed": "50kW", "slots": 3, "lat": 17.4399, "lng": 78.4983},
    {"id": 22, "name": "Kukatpally Eco", "city": "Hyderabad", "state": "Telangana", "speed": "150kW", "slots": 1, "lat": 17.4849, "lng": 78.3894},
    {"id": 23, "name": "Madhapur Fast", "city": "Hyderabad", "state": "Telangana", "speed": "250kW", "slots": 6, "lat": 17.4483, "lng": 78.3915},
    {"id": 24, "name": "Begumpet Central", "city": "Hyderabad", "state": "Telangana", "speed": "100kW", "slots": 4, "lat": 17.4423, "lng": 78.4641},
    # MUMBAI
    {"id": 25, "name": "BKC Business Plug", "city": "Mumbai", "state": "Maharashtra", "speed": "250kW", "slots": 2, "lat": 19.0653, "lng": 72.8658},
    {"id": 26, "name": "Andheri West Hub", "city": "Mumbai", "state": "Maharashtra", "speed": "150kW", "slots": 5, "lat": 19.1363, "lng": 72.8277},
    {"id": 27, "name": "Worli Seaface Charge", "city": "Mumbai", "state": "Maharashtra", "speed": "100kW", "slots": 1, "lat": 19.0169, "lng": 72.8166},
    {"id": 28, "name": "Powai Lake Eco", "city": "Mumbai", "state": "Maharashtra", "speed": "150kW", "slots": 4, "lat": 19.1176, "lng": 72.9060},
    {"id": 29, "name": "Lower Parel Power", "city": "Mumbai", "state": "Maharashtra", "speed": "350kW", "slots": 0, "lat": 18.9953, "lng": 72.8282},
    {"id": 30, "name": "Colaba FastLink", "city": "Mumbai", "state": "Maharashtra", "speed": "50kW", "slots": 3, "lat": 18.9067, "lng": 72.8147},
    {"id": 31, "name": "Bandra Kurla Charge", "city": "Mumbai", "state": "Maharashtra", "speed": "250kW", "slots": 6, "lat": 19.0596, "lng": 72.8295},
    {"id": 32, "name": "Goregaon Tech", "city": "Mumbai", "state": "Maharashtra", "speed": "150kW", "slots": 4, "lat": 19.1646, "lng": 72.8493},
    # DELHI
    {"id": 33, "name": "Connaught Place Hub", "city": "Delhi", "state": "Delhi", "speed": "250kW", "slots": 3, "lat": 28.6304, "lng": 77.2177},
    {"id": 34, "name": "Saket Mall Charge", "city": "Delhi", "state": "Delhi", "speed": "150kW", "slots": 5, "lat": 28.5246, "lng": 77.2066},
    {"id": 35, "name": "Vasant Kunj Plug", "city": "Delhi", "state": "Delhi", "speed": "100kW", "slots": 2, "lat": 28.5293, "lng": 77.1541},
    {"id": 36, "name": "Gurugram Cyber City", "city": "Delhi", "state": "Delhi", "speed": "350kW", "slots": 0, "lat": 28.4901, "lng": 77.0888},
    {"id": 37, "name": "Noida Sector 18", "city": "Delhi", "state": "Delhi", "speed": "250kW", "slots": 4, "lat": 28.5708, "lng": 77.3204},
    {"id": 38, "name": "Dwarka Eco Station", "city": "Delhi", "state": "Delhi", "speed": "50kW", "slots": 6, "lat": 28.5796, "lng": 77.0500},
    {"id": 39, "name": "Hauz Khas FastLink", "city": "Delhi", "state": "Delhi", "speed": "150kW", "slots": 1, "lat": 28.5494, "lng": 77.2001},
    {"id": 40, "name": "Aerocity Premium", "city": "Delhi", "state": "Delhi", "speed": "250kW", "slots": 8, "lat": 28.5492, "lng": 77.1213},
]

bookings_db = []

class BookingRequest(BaseModel):
    station_id: int
    user_name: str
    vehicle_number: str
    date: str
    time: str
    payment_method: str

@app.get("/api/stations")
def get_stations():
    return stations_db

@app.post("/api/book")
def book_slot(booking: BookingRequest):
    for station in stations_db:
        if station["id"] == booking.station_id:
            if station["slots"] > 0:
                station["slots"] -= 1 
                receipt_id = f"VG-{random.randint(100000, 999999)}"
                
                new_booking = {
                    "id": receipt_id,
                    "user_name": booking.user_name,
                    "vehicle_number": booking.vehicle_number,
                    "station_name": station["name"],
                    "date": booking.date,
                    "time": booking.time,
                    "payment_method": booking.payment_method,
                    "amount": "₹450",
                    "payment_status": "Paid" if booking.payment_method == "UPI" else "Pending (Cash)",
                    "booking_timestamp": datetime.datetime.now().timestamp()
                }
                bookings_db.append(new_booking)
                return {"message": "Success", "receipt_id": receipt_id, "booking_details": new_booking}
            else:
                raise HTTPException(status_code=400, detail="No slots available.")
    raise HTTPException(status_code=404, detail="Station not found.")

@app.get("/api/admin/bookings")
def get_all_bookings():
    current_time = datetime.datetime.now().timestamp()
    
    # AUTOMATIC STATUS ALGORITHM
    for b in bookings_db:
        time_elapsed = current_time - b["booking_timestamp"]
        
        # Determine Charging Status based on time
        if time_elapsed < 15:
            b["charging_status"] = "Arriving..."
        elif time_elapsed < 45:
            b["charging_status"] = "⚡ Charging"
        else:
            b["charging_status"] = "✅ Completed"
            
            # If it was a cash payment, automatically mark it as Paid once charging completes
            if b["payment_method"] == "Cash" and b["payment_status"] != "Paid":
                b["payment_status"] = "Paid (Collected)"
                
    return bookings_db