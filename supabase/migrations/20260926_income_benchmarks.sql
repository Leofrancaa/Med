CREATE TABLE IF NOT EXISTS public.income_benchmarks (
  id text PRIMARY KEY,
  label text NOT NULL,
  employer text NOT NULL,
  geography text NOT NULL,
  reference_year smallint NOT NULL CHECK (reference_year BETWEEN 2000 AND 2100),
  monthly_gross_brl numeric(12,2) NOT NULL CHECK (monthly_gross_brl >= 0),
  weekly_hours smallint NOT NULL CHECK (weekly_hours BETWEEN 1 AND 80),
  specialty_scope text NOT NULL,
  source_url text NOT NULL CHECK (source_url LIKE 'https://%'),
  note text NOT NULL
);

ALTER TABLE public.income_benchmarks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.income_benchmarks FROM anon, authenticated;
GRANT SELECT ON public.income_benchmarks TO anon, authenticated;
DROP POLICY IF EXISTS "Dashboard read income benchmarks" ON public.income_benchmarks;
CREATE POLICY "Dashboard read income benchmarks" ON public.income_benchmarks FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.income_benchmarks
  (id, label, employer, geography, reference_year, monthly_gross_brl, weekly_hours, specialty_scope, source_url, note)
VALUES
  ('ebserh_2026_specialist_24h', 'Cargo de médico especialista', 'Ebserh', 'Brasil', 2026, 11464.35, 24,
   'Diversas especialidades do concurso nacional 01/2026',
   'https://conhecimento.fgv.br/sites/default/files/concursos/edital-no-02-area-medica-edital-retificado-1-30.01.2026.pdf',
   'Remuneração bruta anunciada para um vínculo de 24 horas semanais. Não representa renda média total, renda líquida nem garantia de vaga.')
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  employer = EXCLUDED.employer,
  geography = EXCLUDED.geography,
  reference_year = EXCLUDED.reference_year,
  monthly_gross_brl = EXCLUDED.monthly_gross_brl,
  weekly_hours = EXCLUDED.weekly_hours,
  specialty_scope = EXCLUDED.specialty_scope,
  source_url = EXCLUDED.source_url,
  note = EXCLUDED.note;
