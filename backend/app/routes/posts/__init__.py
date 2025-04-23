# Posts routes package

from fastapi import APIRouter
from .create_post import router as create_post_router
from .get_posts import router as get_posts_router
from .upload import router as upload_router
from .delete_post import router as delete_post_router
from .comments import router as comments_router

router = APIRouter()

router.include_router(create_post_router, prefix="/create", tags=["posts"])
router.include_router(get_posts_router, prefix="/get", tags=["posts"])
router.include_router(upload_router, prefix="/upload", tags=["posts"])
router.include_router(delete_post_router, prefix="/delete_post", tags=["posts"])
router.include_router(comments_router, prefix="/comments", tags=["posts"])

__all__ = [
    'create_post_router',
    'get_posts_router',
    'upload_router',
    'delete_post_router',
    'comments_router'
]