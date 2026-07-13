from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class SessionIn(BaseModel):
    session_id: str


class CircleIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    city: str = Field(min_length=1, max_length=80)
    state: str = "NM"
    kind: str = "local"  # local | online
    format: str = "sharing-circle"
    cadence: str = ""
    capacity: int = 12
    summary: str = ""
    description: List[str] = []
    agreements: List[str] = []
    host_name: str = ""
    host_note: str = ""


class MeetingIn(BaseModel):
    start_at: str  # ISO datetime
    end_at: Optional[str] = None
    date_label: str = ""
    time_label: str = ""
    general_location: str = ""
    exact_location: str = ""
    capacity: int = 12


class MeetingUpdateIn(BaseModel):
    start_at: Optional[str] = None
    end_at: Optional[str] = None
    date_label: Optional[str] = None
    time_label: Optional[str] = None
    general_location: Optional[str] = None
    exact_location: Optional[str] = None


class ResourceIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    category: str = "practitioner"  # practitioner | organization | resource
    summary: str = ""
    url: str = ""
    tag: str = "local"  # local | national | online
    city: str = ""
    state: str = "NM"


class ModerateIn(BaseModel):
    action: str  # approve | reject
