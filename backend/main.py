from fastapi import FastAPI
from mangum import Mangum

from app.routes.habits import router as habits_router  #
from app.routes.create_user import router as create_user  #
from app.routes.add_habit import router as add_habit_router  #
from app.routes.get_habit import router as get_habit_router  #
from app.routes.delete_habit import router as delete_habit_router  #
from app.routes.update_habit import router as update_habit_router  #

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello from FastAPI on Lambda!"}

# 👇 Include your habits route
app.include_router(habits_router)
app.include_router(create_user)
app.include_router(add_habit_router)
app.include_router(get_habit_router)
app.include_router(delete_habit_router)
app.include_router(update_habit_router)

# AWS Lambda handler
handler = Mangum(app)
