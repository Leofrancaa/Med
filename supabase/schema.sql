-- Execute before seed.sql in the target Supabase SQL Editor or migration workflow.
-- Public catalog for a read-only dashboard. The report's analytical labels are not statistics.
BEGIN;

CREATE TABLE IF NOT EXISTS public.specialties (
  slug text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  program_years smallint NOT NULL CHECK (program_years BETWEEN 1 AND 6),
  total_training_years smallint NOT NULL CHECK (total_training_years BETWEEN program_years AND 10),
  prerequisite text CHECK (prerequisite IN ('clinica_medica', 'cirurgia_geral')),
  surgical_profile text NOT NULL,
  weekly_hours_min smallint NOT NULL CHECK (weekly_hours_min BETWEEN 1 AND 100),
  weekly_hours_max smallint NOT NULL CHECK (weekly_hours_max BETWEEN weekly_hours_min AND 100),
  quality_of_life_potential text NOT NULL,
  telemedicine_potential text NOT NULL,
  work_settings text NOT NULL,
  market_absorption_proxy text NOT NULL,
  future_demand_trend text NOT NULL,
  ai_task_exposure text NOT NULL,
  geographic_market text NOT NULL,
  market_note text NOT NULL,
  career_paths text NOT NULL,
  private_practice_potential text NOT NULL,
  hospital_potential text NOT NULL,
  research_teaching_potential text NOT NULL,
  clinic_class text NOT NULL,
  capital_requirement text NOT NULL,
  private_revenue_potential text NOT NULL,
  economic_note text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.clinic_cost_scenarios (
  class_code text PRIMARY KEY CHECK (class_code IN ('A', 'B', 'C', 'D')),
  structure text NOT NULL,
  investment_min_brl numeric(12,2) NOT NULL CHECK (investment_min_brl >= 0),
  investment_max_brl numeric(12,2) CHECK (investment_max_brl >= investment_min_brl),
  monthly_fixed_min_brl numeric(12,2) NOT NULL CHECK (monthly_fixed_min_brl >= 0),
  monthly_fixed_max_brl numeric(12,2) CHECK (monthly_fixed_max_brl >= monthly_fixed_min_brl)
);

CREATE TABLE IF NOT EXISTS public.market_indicators (
  metric text NOT NULL,
  geography text NOT NULL,
  reference_year smallint NOT NULL CHECK (reference_year BETWEEN 2000 AND 2100),
  value numeric(14,2) NOT NULL,
  unit text NOT NULL,
  evidence_type text NOT NULL CHECK (evidence_type IN ('observado_no_relatorio', 'estimativa_fonte_no_relatorio', 'aproximado_no_relatorio')),
  report_citation_refs text NOT NULL,
  PRIMARY KEY (metric, geography, reference_year)
);

CREATE INDEX IF NOT EXISTS specialties_training_years_idx ON public.specialties(total_training_years);
CREATE INDEX IF NOT EXISTS market_indicators_geography_idx ON public.market_indicators(geography, reference_year);

ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_cost_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_indicators ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.specialties, public.clinic_cost_scenarios, public.market_indicators FROM anon, authenticated;
GRANT SELECT ON public.specialties, public.clinic_cost_scenarios, public.market_indicators TO anon, authenticated;

DROP POLICY IF EXISTS "Dashboard read specialties" ON public.specialties;
DROP POLICY IF EXISTS "Dashboard read clinic costs" ON public.clinic_cost_scenarios;
DROP POLICY IF EXISTS "Dashboard read indicators" ON public.market_indicators;
CREATE POLICY "Dashboard read specialties" ON public.specialties FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Dashboard read clinic costs" ON public.clinic_cost_scenarios FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Dashboard read indicators" ON public.market_indicators FOR SELECT TO anon, authenticated USING (true);

COMMIT;
