import os
from pathlib import Path

base_dir = Path(r"c:\Users\deepa\Downloads\Cognivault\backend")

# Directory structure
dirs = [
    "models",
    "schemas",
    "routes",
    "services",
    "utils",
    "uploads",
    "faiss_index"
]

for d in dirs:
    (base_dir / d).mkdir(parents=True, exist_ok=True)
    # create __init__.py for python packages
    if d not in ["uploads", "faiss_index"]:
        (base_dir / d / "__init__.py").touch(exist_ok=True)

# File contents
files = {}

files["requirements.txt"] = """fastapi
uvicorn
sqlalchemy
psycopg2-binary
passlib[bcrypt]
python-jose[cryptography]
python-multipart
langchain
langchain-openai
langchain-community
faiss-cpu
tiktoken
pymupdf
pydantic
pydantic-settings
python-dotenv
"""

files["config.py"] = """from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/cognivault"
    SECRET_KEY: str = "super_secret_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    OPENAI_API_KEY: str = "sk-placeholder"

    class Config:
        env_file = ".env"

settings = Settings()
"""

files["database.py"] = """from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
"""

files["models/user.py"] = """from sqlalchemy import Column, Integer, String, DateTime
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="Employee") # Admin, HR, Employee
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
"""

files["models/document.py"] = """from sqlalchemy import Column, Integer, String, DateTime
from database import Base
import datetime

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    file_path = Column(String)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
"""

files["models/chat.py"] = """from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from database import Base
import datetime

class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    query = Column(Text)
    response = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
"""

files["models/faq.py"] = """from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base
import datetime

class FAQ(Base):
    __tablename__ = "faqs"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, index=True)
    answer = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
"""

files["schemas/user.py"] = """from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Optional[str] = "Employee"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
"""

files["schemas/document.py"] = """from pydantic import BaseModel
from datetime import datetime

class DocumentResponse(BaseModel):
    id: int
    title: str
    file_path: str
    upload_date: datetime

    class Config:
        from_attributes = True
"""

files["schemas/chat.py"] = """from pydantic import BaseModel
from datetime import datetime

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    id: int
    user_id: int
    query: str
    response: str
    timestamp: datetime

    class Config:
        from_attributes = True
"""

files["schemas/faq.py"] = """from pydantic import BaseModel
from datetime import datetime

class FAQBase(BaseModel):
    question: str
    answer: str

class FAQCreate(FAQBase):
    pass

class FAQResponse(FAQBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
"""

files["utils/security.py"] = """from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
"""

files["services/auth_service.py"] = """from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
"""

files["services/rag_service.py"] = """import os
from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from config import settings

# Initialize components
embeddings = OpenAIEmbeddings(openai_api_key=settings.OPENAI_API_KEY)
llm = ChatOpenAI(model="gpt-4o-mini", openai_api_key=settings.OPENAI_API_KEY, temperature=0)

FAISS_INDEX_PATH = "faiss_index"

def get_vectorstore():
    if os.path.exists(os.path.join(FAISS_INDEX_PATH, "index.faiss")):
        return FAISS.load_local(FAISS_INDEX_PATH, embeddings, allow_dangerous_deserialization=True)
    return None

def process_document(file_path: str):
    # Load document
    loader = PyMuPDFLoader(file_path)
    documents = loader.load()
    
    # Split
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    docs = text_splitter.split_documents(documents)
    
    # Add to or create FAISS index
    if os.path.exists(os.path.join(FAISS_INDEX_PATH, "index.faiss")):
        vectorstore = FAISS.load_local(FAISS_INDEX_PATH, embeddings, allow_dangerous_deserialization=True)
        vectorstore.add_documents(docs)
    else:
        vectorstore = FAISS.from_documents(docs, embeddings)
        
    vectorstore.save_local(FAISS_INDEX_PATH)
    return len(docs)

def query_rag(query: str) -> str:
    vectorstore = get_vectorstore()
    if not vectorstore:
        return "No documents indexed yet."
        
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    
    system_prompt = (
        "You are an Enterprise Knowledge Assistant. "
        "Use the following pieces of retrieved context to answer the question. "
        "If you don't know the answer, say that you don't know."
        "\\n\\nContext: {context}"
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])
    
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    
    response = rag_chain.invoke({"input": query})
    return response["answer"]
"""

files["routes/auth.py"] = """from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from database import get_db
from models.user import User
from schemas.user import UserCreate, UserResponse, Token
from utils.security import get_password_hash, verify_password, create_access_token
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
"""

files["routes/chat.py"] = """from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.chat import Chat
from schemas.chat import ChatRequest, ChatResponse
from services.auth_service import get_current_user
from services.rag_service import query_rag
from typing import List

router = APIRouter(prefix="/chat", tags=["Chat System"])

@router.post("", response_model=ChatResponse)
def create_chat(request: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Get answer from RAG
    answer = query_rag(request.query)
    
    # 2. Save history
    new_chat = Chat(
        user_id=current_user.id,
        query=request.query,
        response=answer
    )
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    
    return new_chat

@router.get("/history", response_model=List[ChatResponse])
def get_chat_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Chat).filter(Chat.user_id == current_user.id).order_by(Chat.timestamp.desc()).all()
"""

files["routes/documents.py"] = """from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.document import Document
from schemas.document import DocumentResponse
from services.auth_service import get_current_user, require_admin
from services.rag_service import process_document
import os
import shutil
from typing import List

router = APIRouter(prefix="/documents", tags=["Documents"])
UPLOAD_DIR = "uploads"

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_admin)
):
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db_doc = Document(title=file.filename, file_path=file_path)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    
    # Process RAG embeddings in background
    background_tasks.add_task(process_document, file_path)
    
    return db_doc

@router.get("", response_model=List[DocumentResponse])
def get_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Document).all()

@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
        
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}
"""

files["routes/faq.py"] = """from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.faq import FAQ
from schemas.faq import FAQCreate, FAQResponse
from services.auth_service import get_current_user, require_admin
from typing import List

router = APIRouter(prefix="/faqs", tags=["FAQs"])

@router.get("", response_model=List[FAQResponse])
def get_faqs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(FAQ).all()

@router.post("", response_model=FAQResponse)
def create_faq(faq: FAQCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    new_faq = FAQ(question=faq.question, answer=faq.answer)
    db.add(new_faq)
    db.commit()
    db.refresh(new_faq)
    return new_faq

@router.post("/generate-faq")
def generate_faqs(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    # Placeholder for LLM batch extraction
    # E.g. prompt LLM with "extract top 5 FAQs from recent text"
    return {"message": "Generated FAQs successfully. This feature requires specific document targeting."}
"""

files["routes/admin.py"] = """from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.chat import Chat
from schemas.user import UserResponse
from services.auth_service import require_admin
from typing import List

router = APIRouter(prefix="/admin", tags=["Admin Panel"])

@router.get("/users", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return db.query(User).all()

@router.delete("/user/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deleting self
    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
    db.delete(target_user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    total_users = db.query(User).count()
    total_queries = db.query(Chat).count()
    return {
        "total_users": total_users,
        "total_queries": total_queries
    }
"""

files["main.py"] = """from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, chat, documents, faq, admin

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Enterprise Knowledge Assistant API", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(faq.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Enterprise Knowledge Assistant API"}
"""

for file_path, content in files.items():
    with open(base_dir / file_path, "w", encoding="utf-8") as f:
        f.write(content)

print(f"Backend created at {base_dir}")
