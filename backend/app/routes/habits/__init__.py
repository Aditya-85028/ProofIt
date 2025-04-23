# Habits routes package

from app.routes.habits.habits import router as habits_router
from app.routes.habits.add_habit import router as add_habit_router
from app.routes.habits.get_habit import router as get_habit_router
from app.routes.habits.delete_habit import router as delete_habit_router
from app.routes.habits.update_habit import router as update_habit_router

__all__ = [
    'habits_router',
    'add_habit_router',
    'get_habit_router',
    'delete_habit_router',
    'update_habit_router'
]