from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, stocks
from app.services.osc_bridge import stream_stock_to_td
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    stream_stock_to_td("AAPL")
    yield

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MarketPulse API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://market-pulse-jade.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(stocks.router, prefix="/stocks", tags=["Stocks"])

@app.get("/")
def root():
    return {"message": "MarketPulse API is running!"}