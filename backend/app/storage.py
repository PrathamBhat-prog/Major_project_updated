import os
import uuid
from dotenv import load_dotenv

load_dotenv()

STORAGE_MODE = os.getenv("STORAGE_MODE", "local")

LOCAL_STORAGE_DIR = "local_storage"


def upload_bytes(
    file_bytes: bytes,
    folder: str,
    ext: str,
    content_type: str = None,
    original_name: str = None
):
    """
    Saves file bytes locally (or cloud in future).

    Args:
        file_bytes (bytes): File content
        folder (str): Subfolder name (images, excels, reports)
        ext (str): File extension (jpg, pdf, xlsx)
        content_type (str): Optional (for cloud use)
        original_name (str): Original filename (optional)

    Returns:
        str: File URL/path
    """

    if STORAGE_MODE == "local":
        return _save_local(file_bytes, folder, ext, original_name)

    # Placeholder for future cloud integration
    # elif STORAGE_MODE == "s3":
    #     return _upload_to_s3(...)
    # elif STORAGE_MODE == "gcp":
    #     return _upload_to_gcp(...)

    raise ValueError("Unsupported STORAGE_MODE")


# ==================================================
# LOCAL STORAGE
# ==================================================
def _save_local(file_bytes, folder, ext, original_name):
    # Create folder path
    save_dir = os.path.join(LOCAL_STORAGE_DIR, folder)
    os.makedirs(save_dir, exist_ok=True)

    # Generate unique filename
    unique_id = uuid.uuid4().hex

    if original_name:
        base_name = os.path.splitext(original_name)[0]
        filename = f"{base_name}_{unique_id}.{ext}"
    else:
        filename = f"{unique_id}.{ext}"

    file_path = os.path.join(save_dir, filename)

    # Save file
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Return URL path (for frontend access)
    return f"/local_storage/{folder}/{filename}"