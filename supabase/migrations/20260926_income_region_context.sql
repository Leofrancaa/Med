-- Afya 2023 chart 53: all surveyed physicians by region, not specialty-adjustment coefficients.
BEGIN;
CREATE TABLE IF NOT EXISTS public.income_region_context (
  region text NOT NULL,
  reference_year smallint NOT NULL CHECK (reference_year BETWEEN 2000 AND 2100),
  mean_net_monthly_brl numeric(12,2) NOT NULL CHECK (mean_net_monthly_brl > 0),
  respondent_count integer NOT NULL CHECK (respondent_count > 0),
  source_url text NOT NULL CHECK (source_url LIKE 'https://%'),
  PRIMARY KEY (region, reference_year)
);
ALTER TABLE public.income_region_context ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.income_region_context FROM anon, authenticated;
GRANT SELECT ON public.income_region_context TO anon, authenticated;
DROP POLICY IF EXISTS "Dashboard read income regions" ON public.income_region_context;
CREATE POLICY "Dashboard read income regions" ON public.income_region_context FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.income_region_context (region, reference_year, mean_net_monthly_brl, respondent_count, source_url) VALUES
  ('Norte', 2023, 25518, 140, 'https://uploads.production.portal.marketing.afya.systems/wp-content/uploads/2024/06/12191704/Relatorio_Panoramica_Saude-Financeira-do-Medico-2023_05.2024_Divulgacao.pdf'),
  ('Centro-Oeste', 2023, 24975, 193, 'https://uploads.production.portal.marketing.afya.systems/wp-content/uploads/2024/06/12191704/Relatorio_Panoramica_Saude-Financeira-do-Medico-2023_05.2024_Divulgacao.pdf'),
  ('Nordeste', 2023, 23198, 491, 'https://uploads.production.portal.marketing.afya.systems/wp-content/uploads/2024/06/12191704/Relatorio_Panoramica_Saude-Financeira-do-Medico-2023_05.2024_Divulgacao.pdf'),
  ('Sul', 2023, 22895, 444, 'https://uploads.production.portal.marketing.afya.systems/wp-content/uploads/2024/06/12191704/Relatorio_Panoramica_Saude-Financeira-do-Medico-2023_05.2024_Divulgacao.pdf'),
  ('Sudeste', 2023, 22212, 1206, 'https://uploads.production.portal.marketing.afya.systems/wp-content/uploads/2024/06/12191704/Relatorio_Panoramica_Saude-Financeira-do-Medico-2023_05.2024_Divulgacao.pdf')
ON CONFLICT (region, reference_year) DO UPDATE SET mean_net_monthly_brl = EXCLUDED.mean_net_monthly_brl, respondent_count = EXCLUDED.respondent_count, source_url = EXCLUDED.source_url;
COMMIT;
