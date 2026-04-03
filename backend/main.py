import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, stocks
from app.services.osc_bridge import stream_stock_to_td
from contextlib import asynccontextmanager
import asyncio
import uvicorn

import threading

def safe_stream():
    try:
        stream_stock_to_td("AAPL")
    except Exception as e:
        print("Stream error:", e)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await asyncio.sleep(1)  # give FastAPI time to start
    thread = threading.Thread(target=safe_stream, daemon=True)
    thread.start()
    yield

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MarketPulse API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(stocks.router, prefix="/stocks", tags=["Stocks"])

@app.get("/")
def root():
    return {"message": "MarketPulse API is running!"}





if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))  # Railway provides this
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)