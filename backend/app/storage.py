import os
import uuid
from dotenv import load_dotenv

load_dotenv()

# ==================================================
# CONFIG
# ==================================================
STORAGE_MODE = os.getenv("STORAGE_MODE", "local")

# Remove trailing slash if present
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000").rstrip("/")

LOCAL_STORAGE_DIR = "local_storage"


# ==================================================
# MAIN UPLOAD FUNCTION
# ==================================================
def upload_bytes(
    file_bytes: bytes,
    folder: str,
    ext: str,
    content_type: str = None,
    original_name: str = None
):
    """
    Save file locally (or cloud in future)

    Returns:
        Full accessible URL
    """

    if STORAGE_MODE == "local":
        return _save_local(file_bytes, folder, ext, original_name)

    # Future support
    # elif STORAGE_MODE == "s3":
    #     return _upload_to_s3(...)
    # elif STORAGE_MODE == "gcp":
    #     return _upload_to_gcp(...)

    raise ValueError("Unsupported STORAGE_MODE")


# ==================================================
# LOCAL STORAGE
# ==================================================
def _save_local(file_bytes, folder, ext, original_name):
    # Create directory
    save_dir = os.path.join(LOCAL_STORAGE_DIR, folder)
    os.makedirs(save_dir, exist_ok=True)

    # Generate unique filename
    unique_id = uuid.uuid4().hex

    if original_name:
        base_name = os.path.splitext(original_name)[0]
        base_name = base_name.replace(" ", "_")  # clean spaces
        filename = f"{base_name}_{unique_id}.{ext}"
    else:
        filename = f"{unique_id}.{ext}"

    file_path = os.path.join(save_dir, filename)

    # Save file
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Build URL (IMPORTANT)
    return f"{BASE_URL}/local_storage/{folder}/{filename}"