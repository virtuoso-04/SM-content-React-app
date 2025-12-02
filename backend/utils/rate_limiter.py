"""
Rate limiting utilities
"""
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Tuple, Dict


# Simple in-memory rate limiter (for production, use Redis or similar)
request_counts = defaultdict(lambda: {"count": 0, "reset_time": datetime.now()})


def check_rate_limit(
    client_id: str,
    requests_limit: int = 60,
    window_minutes: int = 1
) -> Tuple[bool, Dict]:
    """
    Check if client has exceeded rate limit.
    Returns (is_allowed, rate_limit_info)
    """
    current_time = datetime.now()
    client_data = request_counts[client_id]
    rate_limit_window = timedelta(minutes=window_minutes)
    
    # Reset counter if window has passed
    if current_time >= client_data["reset_time"]:
        client_data["count"] = 0
        client_data["reset_time"] = current_time + rate_limit_window
    
    # Check if limit exceeded
    if client_data["count"] >= requests_limit:
        return False, {
            "limit": requests_limit,
            "remaining": 0,
            "reset_time": client_data["reset_time"].isoformat()
        }
    
    # Increment counter
    client_data["count"] += 1
    
    return True, {
        "limit": requests_limit,
        "remaining": requests_limit - client_data["count"],
        "reset_time": client_data["reset_time"].isoformat()
    }
