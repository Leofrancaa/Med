-- Afya Research Center, self-reported mean monthly net income in the reference year.
-- Surgical groups are kept separate from individual specialties.
BEGIN;
CREATE TABLE IF NOT EXISTS public.specialty_income_surveys (
  id text PRIMARY KEY,
  specialty_slug text REFERENCES public.specialties(slug),
  group_name text,
  reference_year smallint NOT NULL CHECK (reference_year BETWEEN 2000 AND 2100),
  mean_net_monthly_brl numeric(12,2) NOT NULL CHECK (mean_net_monthly_brl > 0),
  respondent_count integer NOT NULL CHECK (respondent_count > 0),
  source_url text NOT NULL CHECK (source_url LIKE 'https://%'),
  CONSTRAINT specialty_or_group CHECK ((specialty_slug IS NULL) <> (group_name IS NULL))
);
CREATE INDEX IF NOT EXISTS specialty_income_surveys_slug_year_idx ON public.specialty_income_surveys (specialty_slug, reference_year DESC);
ALTER TABLE public.specialty_income_surveys ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.specialty_income_surveys FROM anon, authenticated;
GRANT SELECT ON public.specialty_income_surveys TO anon, authenticated;
DROP POLICY IF EXISTS "Dashboard read specialty income" ON public.specialty_income_surveys;
CREATE POLICY "Dashboard read specialty income" ON public.specialty_income_surveys FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.specialty_income_surveys (id, specialty_slug, group_name, reference_year, mean_net_monthly_brl, respondent_count, source_url) VALUES
  ('2023-medicina-intensiva', 'medicina-intensiva', NULL, 2023, 32163, 37, 'https://uploads.production.portal.marketing.afya.systems/wp-content/uploads/2024/06/12191704/Relatorio_Panoramica_Saude-Financeira-do-Medico-2023_05.2024_Divulgacao.pdf'),
  ('2023-cardiologia', 'cardiologia', NULL, 2023, 29970, 162, 'https://uploads.production.portal.marketing.afya.systems/wp-content/uploads/2024/06/12191704/Relatorio_Panoramica_Saude-Financeira-do-Medico-2023_05.2024_Divulgacao.pdf'),
  ('2023-ginecologia-e-obstetricia', 'ginecologia-e-obstetricia', NULL, 2023, 27062, 97, 'https://uploads.production.portal.marketing.afya.systems/wp-content/uploads/2024/06/12191704/Relatorio_Panoramica_Saude-Financeira-do-Medico-2023_05.2024_Divulgacao.pdf'),
  ('2023-psiquiatria', 'psiquiatria', NULL, 2023, 25743, 64, 'https://uploads.production.portal.marketing.afya.systems/wp-content/uploads/2024/06/12191704/Relatorio_Panoramica_Saude-Financeira-do-Medico-2023_05.2024_Divulgacao.pdf'),
  ('2023-pediatria', 'pediatria', NULL, 2023, 24792, 132, 'https://uploads.production.portal.marketing.afya.systems/wp-content/uploads/2024/06/12191704/Relatorio_Panoramica_Saude-Financeira-do-Medico-2023_05.2024_Divulgacao.pdf'),
  ('2023-endocrinologia-e-metabologia', 'endocrinologia-e-metabologia', NULL, 2023, 22664, 61, 'https://uploads.production.portal.marketing.afya.systems/wp-content/uploads/2024/06/12191704/Relatorio_Panoramica_Saude-Financeira-do-Medico-2023_05.2024_Divulgacao.pdf'),
  ('2023-clinica-medica', 'clinica-medica', NULL, 2023, 22084, 102, 'https://uploads.production.portal.marketing.afya.systems/wp-content/uploads/2024/06/12191704/Relatorio_Panoramica_Saude-Financeira-do-Medico-2023_05.2024_Divulgacao.pdf'),
  ('2023-medicina-de-familia-e-comunidade', 'medicina-de-familia-e-comunidade', NULL, 2023, 21624, 117, 'https://uploads.production.portal.marketing.afya.systems/wp-content/uploads/2024/06/12191704/Relatorio_Panoramica_Saude-Financeira-do-Medico-2023_05.2024_Divulgacao.pdf'),
  ('2023-grupo-cirurgico', NULL, 'Especialidades cirúrgicas (cirurgia, oftalmologia, otorrinolaringologia e urologia)', 2023, 32709, 96, 'https://uploads.production.portal.marketing.afya.systems/wp-content/uploads/2024/06/12191704/Relatorio_Panoramica_Saude-Financeira-do-Medico-2023_05.2024_Divulgacao.pdf'),
  ('2022-cardiologia', 'cardiologia', NULL, 2022, 24263.77, 472, 'https://img.pebmed.com.br/wp-content/uploads/2023/04/24141645/Relatorio_Panorama-Financeiro-do-Medico-2022_04.2023.pdf'),
  ('2022-ginecologia-e-obstetricia', 'ginecologia-e-obstetricia', NULL, 2022, 20933.33, 150, 'https://img.pebmed.com.br/wp-content/uploads/2023/04/24141645/Relatorio_Panorama-Financeiro-do-Medico-2022_04.2023.pdf'),
  ('2022-endocrinologia-e-metabologia', 'endocrinologia-e-metabologia', NULL, 2022, 20188.17, 93, 'https://img.pebmed.com.br/wp-content/uploads/2023/04/24141645/Relatorio_Panorama-Financeiro-do-Medico-2022_04.2023.pdf'),
  ('2022-psiquiatria', 'psiquiatria', NULL, 2022, 19623.02, 126, 'https://img.pebmed.com.br/wp-content/uploads/2023/04/24141645/Relatorio_Panorama-Financeiro-do-Medico-2022_04.2023.pdf'),
  ('2022-pediatria', 'pediatria', NULL, 2022, 19386.16, 224, 'https://img.pebmed.com.br/wp-content/uploads/2023/04/24141645/Relatorio_Panorama-Financeiro-do-Medico-2022_04.2023.pdf'),
  ('2022-dermatologia', 'dermatologia', NULL, 2022, 18419.12, 68, 'https://img.pebmed.com.br/wp-content/uploads/2023/04/24141645/Relatorio_Panorama-Financeiro-do-Medico-2022_04.2023.pdf'),
  ('2022-medicina-de-familia-e-comunidade', 'medicina-de-familia-e-comunidade', NULL, 2022, 16214.29, 245, 'https://img.pebmed.com.br/wp-content/uploads/2023/04/24141645/Relatorio_Panorama-Financeiro-do-Medico-2022_04.2023.pdf'),
  ('2022-clinica-medica', 'clinica-medica', NULL, 2022, 15457.14, 175, 'https://img.pebmed.com.br/wp-content/uploads/2023/04/24141645/Relatorio_Panorama-Financeiro-do-Medico-2022_04.2023.pdf'),
  ('2022-grupo-cirurgico', NULL, 'Cirurgiões (grupo agregado da pesquisa)', 2022, 22151.64, 122, 'https://img.pebmed.com.br/wp-content/uploads/2023/04/24141645/Relatorio_Panorama-Financeiro-do-Medico-2022_04.2023.pdf')
ON CONFLICT (id) DO UPDATE SET
 specialty_slug = EXCLUDED.specialty_slug,
 group_name = EXCLUDED.group_name,
 reference_year = EXCLUDED.reference_year,
 mean_net_monthly_brl = EXCLUDED.mean_net_monthly_brl,
 respondent_count = EXCLUDED.respondent_count,
 source_url = EXCLUDED.source_url;
COMMIT;
