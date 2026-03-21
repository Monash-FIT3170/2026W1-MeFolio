#main.py

from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from . import models, schemas

app = FastAPI()

models.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/", response_model=list[schemas.Item])
def read_items(db: Session = Depends(get_db)):
    items = db.query(models.Item).all()
    return items


@app.post("/items", response_model=schemas.Item)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    db_item = models.Item(name=item.name)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item