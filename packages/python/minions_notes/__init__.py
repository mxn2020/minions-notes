"""
Minions Notes Python SDK

Freeform annotations and observations attachable to any Minion
"""

__version__ = "0.1.0"


def create_client(**kwargs):
    """Create a client for Minions Notes.

    Args:
        **kwargs: Configuration options.

    Returns:
        dict: Client configuration.
    """
    return {
        "version": __version__,
        **kwargs,
    }

from .schemas import *
