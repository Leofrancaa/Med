"""Create the committed, read-only Supabase seed from the reviewed RAIS extract."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
rows = json.loads((ROOT / "data/formal-job-rais-2025.json").read_text(encoding="utf-8"))
assert len(rows) == 29
assert len({row["specialty_slug"] for row in rows}) == 29


def quote(value):
    return "'" + str(value).replace("'", "''") + "'"


header = """-- RAIS 2025 formal-job remuneration, 40–44 weekly hours, published by CBO on 99K.
-- A median for one formal job is not total monthly physician income.
BEGIN;
CREATE TABLE IF NOT EXISTS public.specialty_formal_job_rais (
  specialty_slug text NOT NULL REFERENCES public.specialties(slug),
  cbo_code char(6) NOT NULL CHECK (cbo_code ~ '^[0-9]{6}$'),
  reference_month date NOT NULL,
  weekly_hours_min smallint NOT NULL CHECK (weekly_hours_min > 0),
  weekly_hours_max smallint NOT NULL CHECK (weekly_hours_max >= weekly_hours_min),
  formal_job_count integer NOT NULL CHECK (formal_job_count > 0),
  median_monthly_brl numeric(12,2) NOT NULL CHECK (median_monthly_brl > 0),
  p25_monthly_brl numeric(12,2) NOT NULL CHECK (p25_monthly_brl > 0),
  p75_monthly_brl numeric(12,2) NOT NULL CHECK (p75_monthly_brl > 0),
  source_url text NOT NULL CHECK (source_url LIKE 'https://%'),
  PRIMARY KEY (specialty_slug, reference_month),
  CONSTRAINT rais_quartiles_ordered CHECK (p25_monthly_brl <= median_monthly_brl AND median_monthly_brl <= p75_monthly_brl)
);
ALTER TABLE public.specialty_formal_job_rais ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.specialty_formal_job_rais FROM anon, authenticated;
GRANT SELECT ON public.specialty_formal_job_rais TO anon, authenticated;
DROP POLICY IF EXISTS "Dashboard read formal job remuneration" ON public.specialty_formal_job_rais;
CREATE POLICY "Dashboard read formal job remuneration" ON public.specialty_formal_job_rais FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.specialty_formal_job_rais (specialty_slug, cbo_code, reference_month, weekly_hours_min, weekly_hours_max, formal_job_count, median_monthly_brl, p25_monthly_brl, p75_monthly_brl, source_url) VALUES
"""
values = []
for row in rows:
    values.append("  (" + ", ".join([
        quote(row["specialty_slug"]),
        quote(row["cbo_code"]),
        quote(row["reference_month"]),
        str(row["weekly_hours_min"]),
        str(row["weekly_hours_max"]),
        str(row["formal_job_count"]),
        str(row["median_monthly_brl"]),
        str(row["p25_monthly_brl"]),
        str(row["p75_monthly_brl"]),
        quote(row["source_url"]),
    ]) + ")")
footer = "\nON CONFLICT (specialty_slug, reference_month) DO UPDATE SET\n  cbo_code = EXCLUDED.cbo_code, weekly_hours_min = EXCLUDED.weekly_hours_min, weekly_hours_max = EXCLUDED.weekly_hours_max,\n  formal_job_count = EXCLUDED.formal_job_count, median_monthly_brl = EXCLUDED.median_monthly_brl,\n  p25_monthly_brl = EXCLUDED.p25_monthly_brl, p75_monthly_brl = EXCLUDED.p75_monthly_brl, source_url = EXCLUDED.source_url;\nCOMMIT;\n"
path = ROOT / "supabase/migrations/20260928_formal_job_rais_2025.sql"
path.write_text(header + ",\n".join(values) + footer, encoding="utf-8")
print(path)
