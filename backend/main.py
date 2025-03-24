from fastapi import FastAPI
from mangum import Mangum

from app.routes.habits import router as habits_router  #
from app.routes.create_user import router as create_user  #

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello from FastAPI on Lambda!"}

# 👇 Include your habits route
app.include_router(habits_router)
app.include_router(create_user)

# AWS Lambda handler
handler = Mangum(app)
