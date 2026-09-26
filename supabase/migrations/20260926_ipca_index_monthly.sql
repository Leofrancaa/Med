-- IBGE SIDRA table 1737, variable 2266: monthly IPCA index (Dec 1993 = 100).
BEGIN;
CREATE TABLE IF NOT EXISTS public.ipca_index_monthly (
  month date PRIMARY KEY,
  index_value numeric(18,6) NOT NULL CHECK (index_value > 0),
  source_url text NOT NULL CHECK (source_url LIKE 'https://%')
);
ALTER TABLE public.ipca_index_monthly ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ipca_index_monthly FROM anon, authenticated;
GRANT SELECT ON public.ipca_index_monthly TO anon, authenticated;
DROP POLICY IF EXISTS "Dashboard read IPCA index" ON public.ipca_index_monthly;
CREATE POLICY "Dashboard read IPCA index" ON public.ipca_index_monthly FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.ipca_index_monthly (month, index_value, source_url) VALUES
  ('2022-01-01', 6153.09, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2022-02-01', 6215.24, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2022-03-01', 6315.93, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2022-04-01', 6382.88, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2022-05-01', 6412.88, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2022-06-01', 6455.85, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2022-07-01', 6411.95, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2022-08-01', 6388.87, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2022-09-01', 6370.34, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2022-10-01', 6407.93, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2022-11-01', 6434.2, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2022-12-01', 6474.09, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2023-01-01', 6508.4, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2023-02-01', 6563.07, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2023-03-01', 6609.67, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2023-04-01', 6649.99, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2023-05-01', 6665.28, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2023-06-01', 6659.95, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2023-07-01', 6667.94, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2023-08-01', 6683.28, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2023-09-01', 6700.66, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2023-10-01', 6716.74, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2023-11-01', 6735.55, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2023-12-01', 6773.27, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2024-01-01', 6801.72, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2024-02-01', 6858.17, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2024-03-01', 6869.14, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2024-04-01', 6895.24, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2024-05-01', 6926.96, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2024-06-01', 6941.51, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2024-07-01', 6967.89, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2024-08-01', 6966.5, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2024-09-01', 6997.15, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2024-10-01', 7036.33, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2024-11-01', 7063.77, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2024-12-01', 7100.5, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2025-01-01', 7111.86, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2025-02-01', 7205.03, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2025-03-01', 7245.38, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2025-04-01', 7276.54, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2025-05-01', 7295.46, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2025-06-01', 7312.97, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2025-07-01', 7331.98, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2025-08-01', 7323.91, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2025-09-01', 7359.06, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2025-10-01', 7365.68, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2025-11-01', 7378.94, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2025-12-01', 7403.29, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2026-01-01', 7427.72, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2026-02-01', 7479.71, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2026-03-01', 7545.53, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2026-04-01', 7596.09, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2026-05-01', 7640.15, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2026-06-01', 7652.37, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2026-07-01', 7657.73, 'https://sidra.ibge.gov.br/tabela/1737'),
  ('2026-08-01', 7633.23, 'https://sidra.ibge.gov.br/tabela/1737')
ON CONFLICT (month) DO UPDATE SET index_value = EXCLUDED.index_value, source_url = EXCLUDED.source_url;
COMMIT;
