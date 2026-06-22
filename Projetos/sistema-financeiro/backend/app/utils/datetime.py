import datetime as dt
from zoneinfo import ZoneInfo


BRAZIL_TZ = ZoneInfo("America/Sao_Paulo")


def get_brazil_now() -> dt.datetime:
    return dt.datetime.now(BRAZIL_TZ)


def get_brazil_today() -> dt.date:
    return get_brazil_now().date()
