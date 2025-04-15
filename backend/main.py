from fastapi import FastAPI
from mangum import Mangum

# Import routers from organized subdirectories
from app.routes.habits import habits_router, add_habit_router, get_habit_router, delete_habit_router, update_habit_router
from app.routes.users import create_user_router
from app.routes.users.get_user import router as get_user_router
from app.routes.posts import create_post_router, get_posts_router, upload_router, delete_post_router
from app.routes.posts.comments import router as comments_router
from app.routes.likes import like_post_router, get_post_likes_router, check_user_like_router

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello from FastAPI on Lambda!"}

# 👇 Include your habits route
app.include_router(habits_router)
app.include_router(create_user_router)
app.include_router(get_user_router)
app.include_router(add_habit_router)
app.include_router(get_habit_router)
app.include_router(delete_habit_router)
app.include_router(update_habit_router)
app.include_router(create_post_router)
app.include_router(get_posts_router)
app.include_router(upload_router)
app.include_router(delete_post_router)
app.include_router(comments_router)
app.include_router(like_post_router)
app.include_router(get_post_likes_router)
app.include_router(check_user_like_router)

# AWS Lambda handler
handler = Mangum(app)
