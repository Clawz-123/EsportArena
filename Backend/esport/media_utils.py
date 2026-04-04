from urllib.parse import urlparse


def resolve_media_url(request, file_field):
    """Return a safe absolute media URL for either local or Cloudinary storage."""
    if not file_field:
        return None

    url = getattr(file_field, "url", None)
    if not url:
        return None

    parsed = urlparse(url)
    if parsed.scheme and parsed.netloc:
        return url

    if request:
        return request.build_absolute_uri(url)

    return url
