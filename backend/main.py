from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3, time, random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- DATABASE ----------
conn = sqlite3.connect("voltgrid.db", check_same_thread=False)
c = conn.cursor()

# DROP OLD TABLES (prevents ALL mismatch errors)
c.execute("DROP TABLE IF EXISTS users")
c.execute("DROP TABLE IF EXISTS bookings")

# CREATE TABLES
c.execute("""
CREATE TABLE users(
username TEXT,
password TEXT,
email TEXT,
blocked INTEGER
)
""")

c.execute("""
CREATE TABLE bookings(
id TEXT,
user TEXT,
vehicle_type TEXT,
vehicle TEXT,
station TEXT,
date TEXT,
time TEXT,
payment TEXT,
payment_status TEXT,
charging_status TEXT,
timestamp REAL
)
""")

conn.commit()

# ---------- SIGNUP ----------
@app.post("/signup")
def signup(d: dict):
    if d["password"] != d["confirm"]:
        return {"ok": False, "msg": "Passwords mismatch"}

    if c.execute("SELECT * FROM users WHERE username=?", (d["username"],)).fetchone():
        return {"ok": False, "msg": "User exists"}

    c.execute("INSERT INTO users VALUES (?,?,?,0)",
              (d["username"], d["password"], d["email"]))
    conn.commit()
    return {"ok": True}

# ---------- LOGIN ----------
@app.post("/login")
def login(d: dict):

    if d["role"] == "Admin":
        return {"ok": d["username"]=="admin" and d["password"]=="123"}

    if d["role"] == "Attendant":
        return {"ok": d["username"]=="staff" and d["password"]=="321"}

    user = c.execute("SELECT * FROM users WHERE username=? AND password=?",
                     (d["username"], d["password"])).fetchone()

    if not user:
        return {"ok": False}

    if user[3] == 1:
        return {"ok": False, "msg": "Blocked"}

    return {"ok": True}

# ---------- BOOK ----------
@app.post("/book")
def book(d: dict):

    if not all([d.get("vehicle"), d.get("date"), d.get("time"), d.get("station")]):
        return {"ok": False, "msg": "Fill all fields"}

    bid = "VG"+str(random.randint(1000,9999))
    payment_status = "Paid" if d["payment"]=="UPI" else "Pending"

    try:
        c.execute("""
        INSERT INTO bookings VALUES (?,?,?,?,?,?,?,?,?,?,?)
        """,(
            bid,
            d["user"],
            d["vehicle_type"],
            d["vehicle"],
            d["station"],
            d["date"],
            d["time"],
            d["payment"],
            payment_status,
            "Not Started",
            time.time()
        ))
        conn.commit()
        return {"ok": True}
    except Exception as e:
        print(e)
        return {"ok": False}

# ---------- GET ----------
@app.get("/data")
def data():
    rows = c.execute("SELECT * FROM bookings").fetchall()
    return [{
        "id":b[0],
        "user":b[1],
        "vehicle_type":b[2],
        "vehicle":b[3],
        "station":b[4],
        "date":b[5],
        "time":b[6],
        "payment":b[8],
        "charging":b[9]
    } for b in rows]

# ---------- UPDATE ----------
@app.post("/update")
def update(d: dict):
    c.execute("""
    UPDATE bookings 
    SET payment_status=?, charging_status=? 
    WHERE id=?
    """,(d["payment"], d["charging"], d["id"]))
    conn.commit()
    return {"ok": True}

# ---------- BLOCK ----------
@app.post("/block")
def block(d: dict):
    c.execute("UPDATE users SET blocked=1 WHERE username=?", (d["user"],))
    conn.commit()
    return {"ok": True}