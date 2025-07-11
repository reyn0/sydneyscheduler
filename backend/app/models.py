from pydantic import BaseModel
from typing import Any, Dict

class ScrapeResponse(BaseModel):
    data: Dict[str, Any]
