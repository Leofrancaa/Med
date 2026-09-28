"""Extract the published RAIS 2025 formal-employment summaries from 99K.

The resulting measure is a median for one 40–44h formal job, not physician income.
Review extracted rows against the source pages before publishing.
"""

from concurrent.futures import ThreadPoolExecutor
from html import unescape
import json
import re
from urllib.request import Request, urlopen


OCCUPATIONS = {
    "medicina-de-familia-e-comunidade": "medico-de-familia-e-comunidade",
    "clinica-medica": "medico-clinico",
    "pediatria": "medico-pediatra",
    "ginecologia-e-obstetricia": "medico-ginecologista-e-obstetra",
    "psiquiatria": "medico-psiquiatra",
    "dermatologia": "medico-dermatologista",
    "anestesiologia": "medico-anestesiologista",
    "medicina-intensiva": "medico-em-medicina-intensiva",
    "neurologia": "medico-neurologista",
    "oftalmologia": "medico-oftalmologista",
    "otorrinolaringologia": "medico-otorrinolaringologista",
    "ortopedia-e-traumatologia": "medico-ortopedista-e-traumatologista",
    "cirurgia-geral": "medico-cirurgiao-geral",
    "neurocirurgia": "medico-neurocirurgiao",
    "radiologia-e-diagnostico-por-imagem": "medico-em-radiologia-e-diagnostico-por-imagem",
    "patologia": "medico-patologista",
    "infectologia": "medico-infectologista",
    "cardiologia": "medico-cardiologista",
    "endocrinologia-e-metabologia": "medico-endocrinologista-e-metabologista",
    "gastroenterologia": "medico-gastroenterologista",
    "geriatria": "medico-geriatra",
    "hematologia-e-hemoterapia": "medico-hematologista",
    "nefrologia": "medico-nefrologista",
    "pneumologia": "medico-pneumologista",
    "reumatologia": "medico-reumatologista",
    "oncologia-clinica": "medico-oncologista-clinico",
    "urologia": "medico-urologista",
    "cirurgia-plastica": "medico-cirurgiao-plastico",
    "cirurgia-vascular": "medico-em-cirurgia-vascular",
}


def get(slug_and_occupation):
    slug, occupation = slug_and_occupation
    url = f"https://99k.com.br/carreiras/{occupation}"
    request = Request(url, headers={"User-Agent": "Med research dashboard/1.0"})
    with urlopen(request, timeout=20) as response:
        page = unescape(response.read().decode("utf-8"))
    text = re.sub(r"<[^>]+>", " ", page)
    text = re.sub(r"\s+", " ", text)

    def required(pattern):
        match = re.search(pattern, text, re.IGNORECASE)
        if not match:
            raise ValueError(f"{slug}: missing {pattern}")
        return match.group(1)

    cbo = required(r"Código CBO\s+(\d{6})")
    count = required(r"Remuneração mensal em dezembro de\s+2025\s*, no Brasil, entre os\s+([\d.]+)\s+vínculos formais com jornada de 40 a 44 horas")
    median = required(r"Mediana\s+R\$\s*([\d.]+)")
    p25 = required(r"25% ganham até\s+R\$\s*([\d.]+)")
    p75 = required(r"25% ganham acima de\s+R\$\s*([\d.]+)")
    number = lambda s: int(s.replace(".", ""))
    return {
        "specialty_slug": slug,
        "cbo_code": cbo,
        "reference_month": "2025-12-01",
        "weekly_hours_min": 40,
        "weekly_hours_max": 44,
        "formal_job_count": number(count),
        "median_monthly_brl": number(median),
        "p25_monthly_brl": number(p25),
        "p75_monthly_brl": number(p75),
        "source_url": url,
    }


if __name__ == "__main__":
    with ThreadPoolExecutor(max_workers=5) as pool:
        rows = list(pool.map(get, OCCUPATIONS.items()))
    print(json.dumps(rows, ensure_ascii=False, indent=2))
