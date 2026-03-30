"""Helper utilities to access the toxic filter model without repeatedly touching sys.path."""

from functools import lru_cache
from importlib import util
from pathlib import Path

from django.conf import settings


@lru_cache(maxsize=1)
def get_toxic_filter():
    """Load and cache the toxic_filter singleton from ml-models/toxic_filter.py."""
    module_path = Path(settings.BASE_DIR) / "ml-models" / "toxic_filter.py"
    if not module_path.exists():
        raise FileNotFoundError("Missing toxic_filter.py in ml-models directory.")

    spec = util.spec_from_file_location("ml_models.toxic_filter", module_path)
    if spec is None or spec.loader is None:
        raise ImportError("Unable to prepare import spec for toxic_filter module.")

    module = util.module_from_spec(spec)
    spec.loader.exec_module(module)
    filter_instance = getattr(module, "toxic_filter", None)

    # If instance was not created (or is None due to prior failure), try constructing now
    if filter_instance is None:
        if hasattr(module, "ToxicFilter"):
            filter_instance = module.ToxicFilter()
            setattr(module, "toxic_filter", filter_instance)
        else:
            raise ImportError("toxic_filter instance not found in toxic_filter.py")

    return filter_instance
