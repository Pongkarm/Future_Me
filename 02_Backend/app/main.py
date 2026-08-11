from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router

SERVICE_STATUS = "architecture-scaffold"

app = FastAPI(
    title="FutureMe AI Backend Scaffold",
    description="Experimental FastAPI architecture scaffold; not connected to the runnable web app",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {
        "service": "FutureMe AI backend scaffold",
        "status": SERVICE_STATUS,
        "connected_to_web_app": False,
        "docs_url": "/docs"
    }
