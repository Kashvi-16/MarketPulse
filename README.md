# 📈 MarketPulse

> Live stock market data → generative art experiences via TouchDesigner

MarketPulse is a full-stack web application that transforms real-time stock market data into stunning generative visual experiences. Built by an AI Engineer bridging the gap between data science and creative technology.

![Python](https://img.shields.io/badge/Python-3.11-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.135-green) ![React](https://img.shields.io/badge/React-18-blue) ![TouchDesigner](https://img.shields.io/badge/TouchDesigner-2025-purple)

---

## 🎯 What it does

MarketPulse pulls live stock data from financial markets and streams it as OSC messages into TouchDesigner, where the data drives real-time generative visuals. The result is a living, breathing art piece that reflects the pulse of the market.

- **Search any stock** — US markets (AAPL, TSLA, NVDA) or Indian markets (RELIANCE.NS, SBIN.NS, TCS.NS)
- **Live particle canvas** — Browser-based visualization that reacts to price, volatility and volume
- **TouchDesigner bridge** — One click streams live data via OSC protocol into TouchDesigner
- **Generative visuals** — Noise patterns, color fields and particle systems driven by market data
- **Market news** — Real-time news for any stock via NewsAPI
- **Watchlist** — Save and track your favorite stocks
- **Market clock** — Live NSE/BSE and NYSE/NASDAQ open/closed status

---

## 🏗️ Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Frontend │────▶│  FastAPI Backend │────▶│  TouchDesigner  │
│   (Port 5173)   │     │   (Port 8000)   │     │   (Port 7000)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │   yfinance  │
                        │  NewsAPI    │
                        │  SQLite DB  │
                        └─────────────┘
```

**Data flow:**
1. React frontend makes authenticated API calls to FastAPI backend
2. FastAPI fetches live stock data from Yahoo Finance via yfinance
3. OSC bridge streams normalized market values to TouchDesigner every 5 seconds
4. TouchDesigner uses OSC data to drive noise, color and particle parameters
5. User can switch which stock drives the visuals from the web dashboard

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, Recharts, Lucide Icons |
| Backend | Python 3.11, FastAPI, SQLAlchemy, SQLite |
| Auth | JWT tokens, bcrypt password hashing |
| Data | yfinance (Yahoo Finance), NewsAPI |
| Visual Bridge | python-osc, TouchDesigner 2025 |
| Protocol | OSC (Open Sound Control) over UDP |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- TouchDesigner (free non-commercial license)

### Backend Setup
```bash
cd backend
python -m venv myenv
myenv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder:
```
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./marketpulse.db
```

Start the backend:
```bash
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### TouchDesigner Setup

1. Open `MarketPulse.toe` in TouchDesigner
2. The OSC In CHOP is pre-configured to listen on port 7000
3. Start the backend server first, then open TouchDesigner
4. Search any stock on the dashboard and click **Visualize in TD**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/stocks/quote/{symbol}` | Live stock quote |
| GET | `/stocks/history/{symbol}` | 30-day price history |
| GET | `/stocks/watchlist` | Get user's watchlist |
| POST | `/stocks/watchlist/{symbol}` | Add to watchlist |
| DELETE | `/stocks/watchlist/{symbol}` | Remove from watchlist |
| POST | `/stocks/visualize/{symbol}` | Stream symbol to TouchDesigner |
| GET | `/stocks/news/{symbol}` | Latest news for stock |

---

## 🎨 TouchDesigner Visual Pipeline

The OSC bridge streams 5 normalized values to TouchDesigner every 5 seconds:

| OSC Address | Value | Range | Drives |
|---|---|---|---|
| `/stock/price` | Raw price | Market value | Display |
| `/stock/norm_price` | Normalized price | 0.0 - 1.0 | Noise period |
| `/stock/change_pct` | % change | -5 to +5 | Color hue |
| `/stock/norm_change` | Normalized change | 0.0 - 1.0 | Brightness |
| `/stock/volatility` | Price volatility | 0.0 - 1.0 | Amplitude |

---

## 📁 Project Structure
```
StockTD/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   └── models.py          # SQLAlchemy models
│   │   ├── routes/
│   │   │   ├── auth.py            # Auth endpoints
│   │   │   └── stocks.py          # Stock endpoints
│   │   ├── services/
│   │   │   ├── auth.py            # JWT & password logic
│   │   │   ├── stocks.py          # yfinance & news
│   │   │   └── osc_bridge.py      # TouchDesigner OSC stream
│   │   └── database.py            # SQLAlchemy setup
│   ├── main.py                    # FastAPI app entry
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx        # Landing page with canvas
│       │   ├── Login.jsx          # Auth pages
│       │   ├── Register.jsx
│       │   └── Dashboard.jsx      # Main dashboard
│       ├── components/
│       │   └── Navbar.jsx
│       ├── context/
│       │   └── AuthContext.jsx    # Global auth state
│       └── services/
│           └── api.js             # Axios instance
└── MarketPulse.toe                # TouchDesigner project file
```

---

## 💡 Key Engineering Decisions

**Why OSC over WebSocket for TouchDesigner?**
OSC (Open Sound Control) is the industry standard protocol for real-time creative software communication. TouchDesigner has native OSC support making it the most reliable and low-latency option.

**Why yfinance over paid APIs?**
For a portfolio/research project yfinance provides sufficient real-time data without API costs. In production this would be replaced with a paid provider like Alpaca or Polygon.io.

**Why SQLite over PostgreSQL?**
SQLite is sufficient for a single-user portfolio project and requires zero configuration. The SQLAlchemy ORM means switching to PostgreSQL in production requires only a connection string change.

---

## 🔮 Future Improvements

- [ ] WebSocket for real-time price updates in browser
- [ ] Multiple simultaneous stock streams to TouchDesigner
- [ ] Custom OSC parameter mapping from the UI
- [ ] Historical visualization playback
- [ ] Deploy on AWS EC2 with nginx

---

## 👩‍💻 Author

Built as a portfolio project demonstrating the intersection of AI engineering, full-stack development and creative technology.

> *"I build intelligent systems — and experiences that make data tangible and beautiful."*