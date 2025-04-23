# Routes package
# This file imports and exposes all routers from subdirectories

# Import routers from subdirectories
from app.routes.users.create_user import router as create_user_router

from app.routes.habits.habits import router as habits_router
from app.routes.habits.add_habit import router as add_habit_router
from app.routes.habits.get_habit import router as get_habit_router
from app.routes.habits.delete_habit import router as delete_habit_router
from app.routes.habits.update_habit import router as update_habit_router

from app.routes.posts.create_post import router as create_post_router
from app.routes.posts.get_posts import router as get_posts_router
from app.routes.posts.upload import router as upload_router

# Export all routers
__all__ = [
    'create_user_router',
    'users_router',
    'habits_router',
    'add_habit_router',
    'get_habit_router',
    'delete_habit_router',
    'update_habit_router',
    'create_post_router',
    'get_posts_router',
    'upload_router'
]