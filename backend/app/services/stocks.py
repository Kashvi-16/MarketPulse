import yfinance as yf
from datetime import datetime

def get_stock_quote(symbol: str):
    ticker = yf.Ticker(symbol)
    info = ticker.fast_info
    return {
        "symbol": symbol.upper(),
        "price": round(info.last_price, 2),
        "change": round(info.last_price - info.previous_close, 2),
        "change_percent": round(((info.last_price - info.previous_close) / info.previous_close) * 100, 2),
        "volume": info.three_month_average_volume,
        "high": round(info.day_high, 2),
        "low": round(info.day_low, 2),
    }

def get_stock_history(symbol: str, period: str = "1mo"):
    ticker = yf.Ticker(symbol)
    hist = ticker.history(period=period)
    data = []
    for date, row in hist.iterrows():
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "open": round(row["Open"], 2),
            "high": round(row["High"], 2),
            "low": round(row["Low"], 2),
            "close": round(row["Close"], 2),
            "volume": int(row["Volume"]),
        })
    return data