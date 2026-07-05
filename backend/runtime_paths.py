import os
from pathlib import Path
from typing import Tuple


def _repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def _coerce_path(raw_value: str | None, fallback: Path) -> Path:
    if raw_value is None:
        return fallback

    value = str(raw_value).strip().strip('"\'')
    if not value:
        return fallback

    expanded = os.path.expanduser(value)

    if "program files/git" in expanded.lower() and "/app/" in expanded.lower():
        suffix = expanded.split("/app/", 1)[1]
        return (_repo_root() / ".rem" / suffix).resolve()

    if expanded.startswith("/app/"):
        suffix = expanded[5:]
        return (_repo_root() / ".rem" / suffix).resolve()

    path = Path(expanded)
    if not path.is_absolute():
        path = (_repo_root() / path).resolve()
    return path.resolve()


def ensure_runtime_directories() -> Tuple[Path, Path]:
    default_data = (_repo_root() / ".rem" / "data").resolve()
    default_system = (_repo_root() / ".rem" / "system").resolve()

    data_dir = _coerce_path(os.getenv("DATA_ROOT_DIRECTORY"), default_data)
    system_dir = _coerce_path(os.getenv("SYSTEM_ROOT_DIRECTORY"), default_system)

    data_dir.mkdir(parents=True, exist_ok=True)
    system_dir.mkdir(parents=True, exist_ok=True)

    os.environ["DATA_ROOT_DIRECTORY"] = str(data_dir)
    os.environ["SYSTEM_ROOT_DIRECTORY"] = str(system_dir)
    return data_dir, system_dir
