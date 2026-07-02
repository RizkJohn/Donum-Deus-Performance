"""The public /correspondence contact form (apps/web CorrespondenceForm)."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

InquiryType = Literal["general", "foundation", "practice", "stewardship"]


class CorrespondenceIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    given_name: str = Field(min_length=1, max_length=100)
    family_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    inquiry_type: InquiryType = "general"
    message: str = Field(min_length=1, max_length=2000)
