from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, users, sessions

# Create all DB tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NeuroKinetics API",
    description="Backend for the NeuroKinetics smart hand rehabilitation platform",
    version="1.0.0",
)

# Allow your frontend to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-deployed-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(users.router,    prefix="/api/users",    tags=["Users"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["Sessions"])

@app.get("/")
def root():
    return {"message": "NeuroKinetics API is running ⚡"}
