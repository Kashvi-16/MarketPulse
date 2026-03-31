import yfinance as yf
from datetime import datetime
import requests

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

def get_stock_news(symbol: str):
    api_key = "b380a2b46d01453b8266d02c1056e914"
    url = f"https://newsapi.org/v2/everything?q={symbol}+stock&language=en&sortBy=publishedAt&pageSize=5&apiKey={api_key}"
    try:
        res = requests.get(url)
        data = res.json()
        articles = []
        for a in data.get("articles", []):
            if a.get("title") and a.get("url"):
                articles.append({
                    "title": a["title"],
                    "source": a["source"]["name"],
                    "url": a["url"],
                    "published": a["publishedAt"][:10],
                    "description": a.get("description", "")[:150]
                })
        return articles
    except Exception as e:
        return []