from groq import Groq
from app.services.stocks import get_stock_quote, get_stock_history
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def analyze_stock(symbol: str, user_question: str):
    try:
        quote = get_stock_quote(symbol)
        history = get_stock_history(symbol, period="1mo")
        
        prices = [h["close"] for h in history]
        avg_price = sum(prices) / len(prices)
        max_price = max(prices)
        min_price = min(prices)
        first_price = prices[0]
        last_price = prices[-1]
        trend = "upward" if last_price > first_price else "downward"
        trend_pct = round(((last_price - first_price) / first_price) * 100, 2)
        volatility = round(((max_price - min_price) / avg_price) * 100, 2)

        context = f"""You are MarketPulse AI, a strict stock market analyst. Only discuss stock-related topics.
You are a financial analyst AI assistant for MarketPulse. Analyze the following stock data and answer the user's question.

Stock: {symbol}
Current Price: ${quote['price']}
Today's Change: {quote['change']} ({quote['change_percent']}%)
Day High: ${quote['high']}
Day Low: ${quote['low']}

30-Day Analysis:
- Starting Price: ${first_price}
- Current Price: ${last_price}
- 30-Day Trend: {trend} ({trend_pct}%)
- 30-Day High: ${max_price}
- 30-Day Low: ${min_price}
- Average Price: ${round(avg_price, 2)}
- Volatility: {volatility}%

User Question: {user_question}

Provide a concise, data-driven analysis. Always mention this is not financial advice.
Keep response under 150 words. Be direct and specific about the numbers.
"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": context}],
            max_tokens=200,
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Unable to analyze {symbol} right now. Please try again."


def general_market_chat(user_question: str):
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": """You are MarketPulse AI, a strict financial markets assistant. 
You ONLY answer questions about:
- Stocks, shares, and equity markets
- Stock analysis and investment concepts
- Market indices (Sensex, Nifty, S&P 500, NASDAQ etc)
- Financial metrics (P/E ratio, market cap, EPS etc)
- Trading concepts and strategies
- Indian and US stock markets

If asked anything outside finance and stock markets, respond with:
"I'm MarketPulse AI and I only assist with stock market and financial questions. Please ask me something about stocks or markets!"

Keep responses under 120 words. Always note this is not financial advice."""
                },
                {"role": "user", "content": user_question}
            ],
            max_tokens=150,
        )
        return response.choices[0].message.content
    except Exception as e:
        return "I'm having trouble connecting right now. Please try again."