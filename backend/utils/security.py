"""
Security utilities for prompt injection prevention and input sanitization
"""
import re
import logging
from fastapi import HTTPException

logger = logging.getLogger(__name__)

# Suspicious patterns that may indicate prompt injection attempts
SUSPICIOUS_PATTERNS = [
    r"ignore (previous|all|above|prior) (instructions|prompts|commands)",
    r"disregard (previous|all|above|prior) (instructions|prompts|commands)",
    r"forget (previous|all|above|prior) (instructions|prompts|commands)",
    r"you are now",
    r"new (instructions|rules|role|personality)",
    r"system (prompt|message|role)",
    r"<\|.*?\|>",  # Special tokens like <|endoftext|>
    r"###\s*instruction",
    r"---\s*instruction",
    r"act as (if|though)",
    r"pretend (you are|to be)",
    r"roleplay as",
    r"simulate (being|a)",
    r"(execute|run) (code|command|script)",
    r"admin (mode|access|override)",
    r"developer (mode|access|override)",
    r"sudo",
    r"\[SYSTEM\]",
    r"\[ADMIN\]",
]

SUSPICIOUS_REGEX = re.compile('|'.join(SUSPICIOUS_PATTERNS), re.IGNORECASE)


def detect_prompt_injection(text: str) -> tuple[bool, str]:
    """
    Detects potential prompt injection attempts in user input.
    Returns (is_suspicious, reason)
    """
    if not text or not isinstance(text, str):
        return False, ""
    
    # Check for suspicious patterns
    if SUSPICIOUS_REGEX.search(text):
        return True, "Suspicious instruction patterns detected"
    
    # Check for excessive special characters that might break prompts
    special_char_ratio = sum(1 for c in text if c in '<>[]{}|#*`') / max(len(text), 1)
    if special_char_ratio > 0.15:  # More than 15% special chars
        return True, "Excessive special characters"
    
    # Check for repeated instruction-like phrases
    instruction_words = ['instruction', 'command', 'prompt', 'system', 'ignore', 'disregard']
    word_counts = {word: text.lower().count(word) for word in instruction_words}
    if any(count > 3 for count in word_counts.values()):
        return True, "Repeated suspicious keywords"
    
    return False, ""


def sanitize_user_input(text: str, max_length: int = 5000) -> str:
    """
    Sanitizes user input to prevent prompt injection and other attacks.
    """
    if not text or not isinstance(text, str):
        return ""
    
    # Trim to max length
    text = text[:max_length]
    
    # Remove null bytes and other control characters except newlines/tabs
    text = ''.join(char for char in text if char.isprintable() or char in '\n\t')
    
    # Normalize whitespace (remove excessive newlines/spaces)
    text = re.sub(r'\n{4,}', '\n\n\n', text)  # Max 3 consecutive newlines
    text = re.sub(r' {4,}', '   ', text)  # Max 3 consecutive spaces
    
    # Remove zero-width characters that might be used to hide injection attempts
    text = text.replace('\u200b', '').replace('\u200c', '').replace('\u200d', '')
    
    return text.strip()


def validate_and_sanitize(text: str, field_name: str = "input", max_length: int = 5000) -> str:
    """
    Combined validation and sanitization with injection detection.
    Raises HTTPException if injection is detected.
    """
    if not text or not isinstance(text, str):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field_name}: must be a non-empty string"
        )
    
    # Sanitize first
    cleaned = sanitize_user_input(text, max_length)
    
    if not cleaned:
        raise HTTPException(
            status_code=400,
            detail=f"{field_name.capitalize()} is empty after sanitization"
        )
    
    # Check for injection attempts
    is_suspicious, reason = detect_prompt_injection(cleaned)
    if is_suspicious:
        logger.warning(f"Potential prompt injection detected in {field_name}: {reason}")
        raise HTTPException(
            status_code=400,
            detail=f"Your {field_name} contains patterns that may compromise security. Please rephrase your request."
        )
    
    return cleaned
