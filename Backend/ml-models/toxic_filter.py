"""Utility for classifying chat/forum messages for toxicity.

The model and vectorizer are expected to live alongside this file in the
`ml-models` directory. The class is a singleton so the pickles are loaded only
once per process. A small amount of validation and cleaning is performed before
calling the classifier.
"""

import logging
import pickle
import re
import threading
from pathlib import Path
from typing import Any, Dict

try:
    from django.conf import settings
except Exception:  # pragma: no cover - fallback when Django isn't loaded
    settings = None

logger = logging.getLogger(__name__)


class ToxicFilter:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, threshold: float = 0.5) -> None:
        if getattr(self, "_initialized", False):
            return

        try:
            self.threshold = threshold

            base_dir = Path(getattr(settings, "BASE_DIR", Path(__file__).resolve().parent.parent))
            self.models_dir = base_dir / "ml-models"

            self.model_path = self._resolve_path("toxici_model.pkl", "toxic_model.pkl")
            self.vectorizer_path = self._resolve_path("ftidf_vectorizer.pkl", "tfidf_vectorizer.pkl")

            self.model = self._load_pickle(self.model_path, "classification model")
            self.vectorizer = self._load_pickle(self.vectorizer_path, "vectorizer")
            self.positive_index = self._resolve_positive_index()

            self._initialized = True
        except Exception:
            # Ensure subsequent attempts retry initialization
            self._initialized = False
            raise

    def _resolve_path(self, preferred_name: str, fallback_name: str) -> Path:
        preferred = self.models_dir / preferred_name
        fallback = self.models_dir / fallback_name
        if preferred.exists():
            return preferred
        if fallback.exists():
            logger.warning("Preferred model file %s missing, using fallback %s", preferred_name, fallback_name)
            return fallback
        raise FileNotFoundError(
            f"Could not find model asset. Tried: {preferred} and {fallback}. "
            "Ensure the pickle files are present inside ml-models/."
        )

    def _load_pickle(self, path: Path, label: str) -> Any:
        try:
            with path.open("rb") as fh:
                return pickle.load(fh)
        except FileNotFoundError as exc:
            logger.error("%s file not found at %s", label.capitalize(), path)
            raise exc
        except Exception as exc:  # pragma: no cover - defensive
            logger.exception("Failed to load %s from %s", label, path)
            raise

    def _resolve_positive_index(self) -> int:
        classes = getattr(self.model, "classes_", None)
        if classes is None or len(classes) == 0:
            return 1  # default to positive class at index 1 for binary classifiers
        for idx, cls_label in enumerate(classes):
            if cls_label in (1, "1", True, "toxic", "toxic", "bad", "abusive"):
                return idx
        return len(classes) - 1

    def clean_text(self, text: str) -> str:
        if not isinstance(text, str):
            return ""
        cleaned = text.lower()
        cleaned = re.sub(r"https?://\S+|www\.\S+", " ", cleaned)
        cleaned = re.sub(r"[^a-z0-9\s]", " ", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    
    def check_message(self, message: str) -> Dict[str, Any]:
        if not hasattr(self, "model") or not hasattr(self, "vectorizer"):
            # Attempt a lazy re-init if prior init failed
            logger.warning("ToxicFilter missing model/vectorizer; retrying initialization.")
            self.__init__(threshold=self.threshold)
            if not hasattr(self, "model") or not hasattr(self, "vectorizer"):
                raise RuntimeError("Toxic filter not properly initialized; model or vectorizer missing.")

        cleaned = self.clean_text(message)
        if not cleaned:
            return {"is_toxic": False, "confidence": 0.0, "cleaned_text": cleaned}

        features = self.vectorizer.transform([cleaned])

        try:
            probabilities = self.model.predict_proba(features)[0]
            score = float(probabilities[self.positive_index])
        except Exception:  # pragma: no cover - fallback for models without predict_proba
            try:
                prediction = self.model.predict(features)[0]
                score = 1.0 if prediction else 0.0
            except Exception as exc:
                logger.exception("Toxicity prediction failed: %s", exc)
                raise

        is_toxic = score >= self.threshold
        return {"is_toxic": bool(is_toxic), "confidence": score, "cleaned_text": cleaned}

    def is_toxic(self, message: str) -> bool:
        result = self.check_message(message)
        return result.get("is_toxic", False)


# Expose a singleton instance for easy reuse
try:
    toxic_filter = ToxicFilter()
except Exception:
    logger.exception("ToxicFilter failed to initialize. Calls to is_toxic/check_message will raise until resolved.")
    toxic_filter = None
