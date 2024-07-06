from app import app

@app.route('/')
def index():
    return "Welcome to the US Senator Stock Trades API"

@app.route('/api/trades')
def get_trades():
    # Placeholder for getting trades data
    return {"trades": "This is where the trades data will be returned"}
