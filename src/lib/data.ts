import snapshot from "../../data/dashboard-data.json";
import serviceSnapshot from "../../data/service-benchmarks.json";
import surveySnapshot from "../../data/specialty-income-surveys.json";
import ipcaSnapshot from "../../data/ipca-index-monthly.json";
import regionSnapshot from "../../data/income-region-context.json";
import formalJobSnapshot from "../../data/formal-job-rais-2025.json";

export type Specialty = (typeof snapshot.specialties)[number];
export type CostScenario = (typeof snapshot.clinic_cost_scenarios)[number];
export type MarketIndicator = (typeof snapshot.market_indicators)[number];
export type IncomeBenchmark = (typeof snapshot.income_benchmarks)[number];
export type ServiceBenchmark = (typeof serviceSnapshot)[number];
export type SpecialtyIncomeSurvey = (typeof surveySnapshot)[number] & { source_url?: string };
export type IpcaIndex = (typeof ipcaSnapshot)[number];
export type IncomeRegionContext = (typeof regionSnapshot)[number];
export type FormalJobBenchmark = (typeof formalJobSnapshot)[number];

export type DashboardData = {
  specialties: Specialty[];
  costs: CostScenario[];
  indicators: MarketIndicator[];
  incomeBenchmarks: IncomeBenchmark[];
  serviceBenchmarks: ServiceBenchmark[];
  specialtyIncomeSurveys: SpecialtyIncomeSurvey[];
  inflationIndex: IpcaIndex[];
  inflationSource: "ibge" | "supabase" | "snapshot";
  incomeRegions: IncomeRegionContext[];
  formalJobBenchmarks: FormalJobBenchmark[];
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
  ipca_index_monthly: "month.asc",
  income_region_context: "mean_net_monthly_brl.desc",
  specialty_formal_job_rais: "specialty_slug.asc",
} as const;

async function fetchOfficialInflationIndex(): Promise<IpcaIndex[]> {
  const now = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit" }).format(new Date()).replace("-", "");
  const response = await fetch(`https://apisidra.ibge.gov.br/values/t/1737/n1/all/v/2266/p/202201-${now}/d/v2266%2013`, {
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) throw new Error(`A leitura do IPCA retornou HTTP ${response.status}.`);
  const raw = await response.json() as { D3C?: string; V?: string }[];
  const rows = raw.slice(1).map((row) => ({
    month: `${row.D3C?.slice(0, 4)}-${row.D3C?.slice(4, 6)}-01`,
    index_value: Number(row.V),
  })).filter((row) => /^20\d{2}-(0[1-9]|1[0-2])-01$/.test(row.month) && Number.isFinite(row.index_value) && row.index_value > 0);
  if (rows.filter((row) => row.month.startsWith("2022-")).length !== 12 || rows.filter((row) => row.month.startsWith("2023-")).length !== 12) throw new Error("A série IPCA está incompleta.");
  return rows.sort((a, b) => a.month.localeCompare(b.month));
}

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
  const liveInflation = await fetchOfficialInflationIndex().catch(() => null);
  const inflationFrom = (stored: IpcaIndex[], storedSource: "supabase" | "snapshot") => {
    const baseline = stored.length ? stored : ipcaSnapshot;
    return liveInflation && liveInflation.at(-1)!.month >= baseline.at(-1)!.month
      ? { rows: liveInflation, source: "ibge" as const }
      : { rows: baseline, source: storedSource };
  };

  if (!url || !key) {
    const inflation = inflationFrom(ipcaSnapshot, "snapshot");
    return {
      specialties: snapshot.specialties,
      costs: snapshot.clinic_cost_scenarios,
      indicators: snapshot.market_indicators,
      incomeBenchmarks: snapshot.income_benchmarks,
      serviceBenchmarks: serviceSnapshot,
      specialtyIncomeSurveys: surveySnapshot,
      inflationIndex: inflation.rows,
      inflationSource: inflation.source,
      incomeRegions: regionSnapshot,
      formalJobBenchmarks: formalJobSnapshot,
      source: "snapshot",
      warning: "Exibindo a cópia dos dados incluída no projeto. Configure a conexão Supabase para atualizar o painel.",
    };
  }

  try {
    const [specialties, costs, indicators, incomeBenchmarks, serviceBenchmarks, specialtyIncomeSurveys, storedInflation, incomeRegions, formalJobBenchmarks] = await Promise.all([
      fetchTable<Specialty>("specialties", url, key),
      fetchTable<CostScenario>("clinic_cost_scenarios", url, key),
      fetchTable<MarketIndicator>("market_indicators", url, key),
      fetchTable<IncomeBenchmark>("income_benchmarks", url, key),
      fetchTable<ServiceBenchmark>("specialty_service_benchmarks", url, key),
      fetchTable<SpecialtyIncomeSurvey>("specialty_income_surveys", url, key),
      fetchTable<IpcaIndex>("ipca_index_monthly", url, key),
      fetchTable<IncomeRegionContext>("income_region_context", url, key),
      fetchTable<FormalJobBenchmark>("specialty_formal_job_rais", url, key),
    ]);

    const inflation = inflationFrom(storedInflation, "supabase");
    return { specialties, costs, indicators, incomeBenchmarks, serviceBenchmarks, specialtyIncomeSurveys, inflationIndex: inflation.rows, inflationSource: inflation.source, incomeRegions, formalJobBenchmarks, source: "supabase" };
  } catch {
    const inflation = inflationFrom(ipcaSnapshot, "snapshot");
    return {
      specialties: snapshot.specialties,
      costs: snapshot.clinic_cost_scenarios,
      indicators: snapshot.market_indicators,
      incomeBenchmarks: snapshot.income_benchmarks,
      serviceBenchmarks: serviceSnapshot,
      specialtyIncomeSurveys: surveySnapshot,
      inflationIndex: inflation.rows,
      inflationSource: inflation.source,
      incomeRegions: regionSnapshot,
      formalJobBenchmarks: formalJobSnapshot,
      source: "snapshot",
      warning: "O Supabase está indisponível agora. O painel mostra a cópia de 26/09/2026.",
    };
  }
}
