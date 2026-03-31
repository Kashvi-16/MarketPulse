from pythonosc import udp_client
import threading
import time
import yfinance as yf

client = udp_client.SimpleUDPClient("127.0.0.1", 7000)

def normalize(value, min_val, max_val):
    if max_val == min_val:
        return 0.5
    return max(0.0, min(1.0, (value - min_val) / (max_val - min_val)))

def stream_stock_to_td(symbol: str, interval: int = 5):
    def run():
        prices = []
        while True:
            try:
                ticker = yf.Ticker(symbol)
                price = ticker.fast_info.last_price
                prev_close = ticker.fast_info.previous_close
                change_pct = ((price - prev_close) / prev_close) * 100
                prices.append(price)
                if len(prices) > 20:
                    prices.pop(0)

                norm_price = normalize(price, min(prices), max(prices))
                norm_change = normalize(change_pct, -5, 5)
                volatility = normalize(max(prices) - min(prices), 0, 20)

                client.send_message("/stock/price", float(price))
                client.send_message("/stock/norm_price", float(norm_price))
                client.send_message("/stock/change_pct", float(change_pct))
                client.send_message("/stock/norm_change", float(norm_change))
                client.send_message("/stock/volatility", float(volatility))

                print(f"[OSC] {symbol}: ${price:.2f} | change: {change_pct:.2f}% | volatility: {volatility:.2f}")
            except Exception as e:
                print(f"[OSC Error] {e}")
            time.sleep(interval)

    thread = threading.Thread(target=run, daemon=True)
    thread.start()