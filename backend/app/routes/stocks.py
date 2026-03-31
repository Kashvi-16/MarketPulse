from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.stocks import get_stock_quote, get_stock_history
from app.services.auth import decode_token
from app.models.models import WatchList
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    username = decode_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    return username

@router.get("/quote/{symbol}")
def quote(symbol: str, user=Depends(get_current_user)):
    try:
        return get_stock_quote(symbol)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/history/{symbol}")
def history(symbol: str, period: str = "1mo", user=Depends(get_current_user)):
    try:
        return get_stock_history(symbol, period)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/watchlist/{symbol}")
def add_to_watchlist(symbol: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    existing = db.query(WatchList).filter(WatchList.symbol == symbol.upper(), WatchList.user_id == user).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already in watchlist")
    item = WatchList(user_id=user, symbol=symbol.upper())
    db.add(item)
    db.commit()
    return {"message": f"{symbol.upper()} added to watchlist"}

@router.get("/watchlist")
def get_watchlist(db: Session = Depends(get_db), user=Depends(get_current_user)):
    items = db.query(WatchList).filter(WatchList.user_id == user).all()
    return [item.symbol for item in items]

@router.delete("/watchlist/{symbol}")
def remove_from_watchlist(symbol: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    item = db.query(WatchList).filter(WatchList.symbol == symbol.upper(), WatchList.user_id == user).first()
    if not item:
        raise HTTPException(status_code=404, detail="Symbol not found in watchlist")
    db.delete(item)
    db.commit()
    return {"message": f"{symbol.upper()} removed from watchlist"}