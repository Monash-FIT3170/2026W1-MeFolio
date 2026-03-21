from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session
from .db import SessionLocal, engine
from . import models, schemas

app = FastAPI()

models.Base.metadata.create_all(bind=engine)

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

@app.get("/") #path operation decorator - GET request at path /
async def root():
   return {"message": "Hello World"}

# @app.post("/items", response_model=schemas.Item)
# def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
#     db_item = models.Item(name=item.name)
#     db.add(db_item)
#     db.commit()
#     db.refresh(db_item)
#     return db_item