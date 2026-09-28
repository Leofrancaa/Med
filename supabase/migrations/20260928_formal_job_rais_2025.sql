-- RAIS 2025 formal-job remuneration, 40–44 weekly hours, published by CBO on 99K.
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
  ('medicina-de-familia-e-comunidade', '225130', '2025-12-01', 40, 44, 4676, 17211, 15032, 22086, 'https://99k.com.br/carreiras/medico-de-familia-e-comunidade'),
  ('clinica-medica', '225125', '2025-12-01', 40, 44, 67274, 13201, 9194, 18753, 'https://99k.com.br/carreiras/medico-clinico'),
  ('pediatria', '225124', '2025-12-01', 40, 44, 4012, 12670, 8397, 19181, 'https://99k.com.br/carreiras/medico-pediatra'),
  ('ginecologia-e-obstetricia', '225250', '2025-12-01', 40, 44, 2670, 12291, 8017, 17899, 'https://99k.com.br/carreiras/medico-ginecologista-e-obstetra'),
  ('psiquiatria', '225133', '2025-12-01', 40, 44, 1325, 10500, 7000, 15710, 'https://99k.com.br/carreiras/medico-psiquiatra'),
  ('dermatologia', '225135', '2025-12-01', 40, 44, 329, 8695, 6000, 12159, 'https://99k.com.br/carreiras/medico-dermatologista'),
  ('anestesiologia', '225151', '2025-12-01', 40, 44, 942, 15356, 10532, 22132, 'https://99k.com.br/carreiras/medico-anestesiologista'),
  ('medicina-intensiva', '225150', '2025-12-01', 40, 44, 2759, 12641, 12100, 18324, 'https://99k.com.br/carreiras/medico-em-medicina-intensiva'),
  ('neurologia', '225112', '2025-12-01', 40, 44, 466, 11469, 6496, 20456, 'https://99k.com.br/carreiras/medico-neurologista'),
  ('oftalmologia', '225265', '2025-12-01', 40, 44, 450, 9174, 5554, 15020, 'https://99k.com.br/carreiras/medico-oftalmologista'),
  ('otorrinolaringologia', '225275', '2025-12-01', 40, 44, 295, 10079, 6547, 16513, 'https://99k.com.br/carreiras/medico-otorrinolaringologista'),
  ('ortopedia-e-traumatologia', '225270', '2025-12-01', 40, 44, 1322, 13147, 8187, 20653, 'https://99k.com.br/carreiras/medico-ortopedista-e-traumatologista'),
  ('cirurgia-geral', '225225', '2025-12-01', 40, 44, 2411, 9900, 6035, 16000, 'https://99k.com.br/carreiras/medico-cirurgiao-geral'),
  ('neurocirurgia', '225260', '2025-12-01', 40, 44, 145, 17401, 10846, 24653, 'https://99k.com.br/carreiras/medico-neurocirurgiao'),
  ('radiologia-e-diagnostico-por-imagem', '225320', '2025-12-01', 40, 44, 708, 12794, 7730, 24336, 'https://99k.com.br/carreiras/medico-em-radiologia-e-diagnostico-por-imagem'),
  ('patologia', '225325', '2025-12-01', 40, 44, 61, 11275, 6376, 22607, 'https://99k.com.br/carreiras/medico-patologista'),
  ('infectologia', '225103', '2025-12-01', 40, 44, 360, 10856, 7240, 15600, 'https://99k.com.br/carreiras/medico-infectologista'),
  ('cardiologia', '225120', '2025-12-01', 40, 44, 820, 10232, 6369, 16758, 'https://99k.com.br/carreiras/medico-cardiologista'),
  ('endocrinologia-e-metabologia', '225155', '2025-12-01', 40, 44, 255, 8804, 5917, 11692, 'https://99k.com.br/carreiras/medico-endocrinologista-e-metabologista'),
  ('gastroenterologia', '225165', '2025-12-01', 40, 44, 159, 8909, 6079, 13048, 'https://99k.com.br/carreiras/medico-gastroenterologista'),
  ('geriatria', '225180', '2025-12-01', 40, 44, 91, 8817, 5255, 12308, 'https://99k.com.br/carreiras/medico-geriatra'),
  ('hematologia-e-hemoterapia', '225185', '2025-12-01', 40, 44, 107, 13208, 10127, 22977, 'https://99k.com.br/carreiras/medico-hematologista'),
  ('nefrologia', '225109', '2025-12-01', 40, 44, 153, 13405, 7584, 20309, 'https://99k.com.br/carreiras/medico-nefrologista'),
  ('pneumologia', '225127', '2025-12-01', 40, 44, 145, 10040, 7058, 15614, 'https://99k.com.br/carreiras/medico-pneumologista'),
  ('reumatologia', '225136', '2025-12-01', 40, 44, 109, 8000, 5582, 12118, 'https://99k.com.br/carreiras/medico-reumatologista'),
  ('oncologia-clinica', '225121', '2025-12-01', 40, 44, 947, 13840, 12300, 15372, 'https://99k.com.br/carreiras/medico-oncologista-clinico'),
  ('urologia', '225285', '2025-12-01', 40, 44, 334, 8638, 5689, 14302, 'https://99k.com.br/carreiras/medico-urologista'),
  ('cirurgia-plastica', '225235', '2025-12-01', 40, 44, 92, 8079, 4795, 17109, 'https://99k.com.br/carreiras/medico-cirurgiao-plastico'),
  ('cirurgia-vascular', '225203', '2025-12-01', 40, 44, 144, 12367, 8712, 17601, 'https://99k.com.br/carreiras/medico-em-cirurgia-vascular')
ON CONFLICT (specialty_slug, reference_month) DO UPDATE SET
  cbo_code = EXCLUDED.cbo_code, weekly_hours_min = EXCLUDED.weekly_hours_min, weekly_hours_max = EXCLUDED.weekly_hours_max,
  formal_job_count = EXCLUDED.formal_job_count, median_monthly_brl = EXCLUDED.median_monthly_brl,
  p25_monthly_brl = EXCLUDED.p25_monthly_brl, p75_monthly_brl = EXCLUDED.p75_monthly_brl, source_url = EXCLUDED.source_url;
COMMIT;
