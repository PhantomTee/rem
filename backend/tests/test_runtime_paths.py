import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from runtime_paths import ensure_runtime_directories


class RuntimePathsTest(unittest.TestCase):
    def test_ensure_runtime_directories_creates_requested_paths(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            data_path = Path(tmpdir) / "data"
            system_path = Path(tmpdir) / "system"
            with patch.dict(
                os.environ,
                {
                    "DATA_ROOT_DIRECTORY": str(data_path),
                    "SYSTEM_ROOT_DIRECTORY": str(system_path),
                },
                clear=False,
            ):
                resolved_data, resolved_system = ensure_runtime_directories()

            self.assertEqual(resolved_data, data_path.resolve())
            self.assertEqual(resolved_system, system_path.resolve())
            self.assertTrue(resolved_data.exists())
            self.assertTrue(resolved_system.exists())


if __name__ == "__main__":
    unittest.main()
