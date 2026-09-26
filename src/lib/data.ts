import snapshot from "../../data/dashboard-data.json";
import serviceSnapshot from "../../data/service-benchmarks.json";
import surveySnapshot from "../../data/specialty-income-surveys.json";

export type Specialty = (typeof snapshot.specialties)[number];
export type CostScenario = (typeof snapshot.clinic_cost_scenarios)[number];
export type MarketIndicator = (typeof snapshot.market_indicators)[number];
export type IncomeBenchmark = (typeof snapshot.income_benchmarks)[number];
export type ServiceBenchmark = (typeof serviceSnapshot)[number];
export type SpecialtyIncomeSurvey = (typeof surveySnapshot)[number] & { source_url?: string };

export type DashboardData = {
  specialties: Specialty[];
  costs: CostScenario[];
  indicators: MarketIndicator[];
  incomeBenchmarks: IncomeBenchmark[];
  serviceBenchmarks: ServiceBenchmark[];
  specialtyIncomeSurveys: SpecialtyIncomeSurvey[];
  source: "supabase" | "snapshot";
  warning?: string;
};

const tableOrder = {
  specialties: "name.asc",
  clinic_cost_scenarios: "class_code.asc",
  market_indicators: "metric.asc,geography.asc",
  income_benchmarks: "reference_year.desc",
  specialty_service_benchmarks: "specialty_slug.asc,category.asc",
  specialty_income_surveys: "reference_year.desc,mean_net_monthly_brl.desc",
} as const;

async function fetchTable<T>(table: keyof typeof tableOrder, url: string, key: string): Promise<T[]> {
  const params = new URLSearchParams({ select: "*", order: tableOrder[table], limit: "1000" });
  const response = await fetch(`${url}/rest/v1/${table}?${params}`, {
    headers: { apikey: key },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`A leitura de ${table} retornou HTTP ${response.status}.`);
  }

  return (await response.json()) as T[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return {
      specialties: snapshot.specialties,
      costs: snapshot.clinic_cost_scenarios,
      indicators: snapshot.market_indicators,
      incomeBenchmarks: snapshot.income_benchmarks,
      serviceBenchmarks: serviceSnapshot,
      specialtyIncomeSurveys: surveySnapshot,
      source: "snapshot",
      warning: "Exibindo a cópia dos dados incluída no projeto. Configure a conexão Supabase para atualizar o painel.",
    };
  }

  try {
    const [specialties, costs, indicators, incomeBenchmarks, serviceBenchmarks, specialtyIncomeSurveys] = await Promise.all([
      fetchTable<Specialty>("specialties", url, key),
      fetchTable<CostScenario>("clinic_cost_scenarios", url, key),
      fetchTable<MarketIndicator>("market_indicators", url, key),
      fetchTable<IncomeBenchmark>("income_benchmarks", url, key),
      fetchTable<ServiceBenchmark>("specialty_service_benchmarks", url, key),
      fetchTable<SpecialtyIncomeSurvey>("specialty_income_surveys", url, key),
    ]);

    return { specialties, costs, indicators, incomeBenchmarks, serviceBenchmarks, specialtyIncomeSurveys, source: "supabase" };
  } catch {
    return {
      specialties: snapshot.specialties,
      costs: snapshot.clinic_cost_scenarios,
      indicators: snapshot.market_indicators,
      incomeBenchmarks: snapshot.income_benchmarks,
      serviceBenchmarks: serviceSnapshot,
      specialtyIncomeSurveys: surveySnapshot,
      source: "snapshot",
      warning: "O Supabase está indisponível agora. O painel mostra a cópia de 26/09/2026.",
    };
  }
}
