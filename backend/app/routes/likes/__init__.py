from app.routes.likes.like_post import router as like_post_router
from app.routes.likes.get_post_likes import router as get_post_likes_router
from app.routes.likes.check_user_like import router as check_user_like_router

__all__ = [
    'like_post_router',
    'get_post_likes_router',
    'check_user_like_router'
] 