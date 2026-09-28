"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Database,
  GraduationCap,
  Info,
  MapPinned,
  Menu,
  Plus,
  Search,
  SlidersHorizontal,
  Wallet,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CostScenario, DashboardData, Specialty } from "@/lib/data";
import { ServiceEarnings } from "@/components/service-earnings";
import { MonthlyIncome } from "@/components/monthly-income";
import { FormalIncome } from "@/components/formal-income";
import { inflationFactorForYear } from "@/lib/inflation";

type Sort = "name" | "years" | "hours";
const maxCompare = 3;
const regions = ["Sudeste", "Sul", "Nordeste", "Centro-Oeste", "Norte"];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
}

function formatMoneyExact(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function metric(data: DashboardData, key: string, geography = "Brasil") {
  return data.indicators.find((item) => item.metric === key && item.geography === geography);
}

function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (value: boolean) => void }) {
  const links = [
    { href: "#visao-geral", label: "Visão geral", icon: BarChart3 },
    { href: "#renda", label: "Renda", icon: Wallet },
    { href: "#renda-por-especialidade", label: "Por especialidade", icon: BarChart3 },
    { href: "#producao", label: "Por atendimento", icon: BarChart3 },
    { href: "#especialidades", label: "Especialidades", icon: GraduationCap },
    { href: "#comparar", label: "Comparar", icon: SlidersHorizontal },
    { href: "#metodologia", label: "Metodologia", icon: CircleHelp },
  ];
  return (
    <>
      <div className="mobile-topbar">
        <a className="wordmark" href="#visao-geral">med<span>.</span></a>
        <button type="button" aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <a className="wordmark desktop-wordmark" href="#visao-geral">med<span>.</span></a>
        <p className="sidebar-caption">Escolha de residência</p>
        <nav aria-label="Navegação principal" className="sidebar-nav">
          {links.map(({ href, label, icon: Icon }, index) => (
            <a key={href} href={href} className={index === 0 ? "sidebar-link sidebar-link-active" : "sidebar-link"} onClick={() => setMobileOpen(false)}>
              <Icon size={17} strokeWidth={1.8} aria-hidden="true" />{label}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom"><span className="sidebar-dot" /> Pesquisa organizada para estudantes de medicina no Brasil.</div>
      </aside>
    </>
  );
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: typeof BarChart3; label: string; value: string; detail: string }) {
  return (
    <div className="metric-card">
      <div className="metric-card-head"><span>{label}</span><Icon size={18} strokeWidth={1.7} aria-hidden="true" /></div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function IncomeSection({ data }: { data: DashboardData }) {
  const benchmark = data.incomeBenchmarks[0];
  const [contract, setContract] = useState(String(benchmark?.monthly_gross_brl ?? 0));
  const [shifts, setShifts] = useState("0");
  const [shiftValue, setShiftValue] = useState("0");
  const [privateRevenue, setPrivateRevenue] = useState("0");
  const [expenses, setExpenses] = useState("0");
  const amount = (value: string) => Math.max(0, Number(value) || 0);
  const gross = amount(contract) + amount(shifts) * amount(shiftValue) + amount(privateRevenue);
  const afterExpenses = gross - amount(expenses);

  return <section className="income-section" id="renda" aria-labelledby="income-heading">
    <div className="section-header"><div><span className="section-overline">Depois da residência</span><h2 id="income-heading">Quanto pode ganhar?</h2><p>Um salário de edital verificável e um cenário que você pode ajustar. Valores mensais antes de impostos.</p></div></div>
    <div className="income-grid">
      <div className="income-benchmark">
        <div className="income-card-eyebrow"><Wallet size={17} aria-hidden="true" /> Referência de vínculo público</div>
        <strong>{benchmark ? formatMoneyExact(Number(benchmark.monthly_gross_brl)) : "Sem referência"}</strong>
        <span>brutos por mês · {benchmark?.weekly_hours ?? "—"}h/semana</span>
        <p>{benchmark?.employer ?? "Ebserh"} · concurso nacional {benchmark?.reference_year ?? 2026} para cargos de médico especialista.</p>
        {benchmark && <a href={benchmark.source_url} target="_blank" rel="noopener noreferrer">Consultar edital de origem <ArrowRight size={15} /></a>}
        <small>Este é o valor de um cargo específico, não a média de renda dos especialistas nem uma promessa de contratação.</small>
      </div>
      <div className="income-calculator">
        <div className="income-calculator-heading"><div><h3>Monte um cenário mensal</h3><p>Edite os valores para representar uma proposta ou plano de trabalho.</p></div><span className="evidence-tag evidence-analytic">Simulação</span></div>
        <div className="income-fields">
          <label>Vínculo mensal (R$)<input type="number" min="0" step="100" value={contract} onChange={(event) => setContract(event.target.value)} /></label>
          <label>Plantões por mês<input type="number" min="0" max="40" step="1" value={shifts} onChange={(event) => setShifts(event.target.value)} /></label>
          <label>Valor por plantão (R$)<input type="number" min="0" step="100" value={shiftValue} onChange={(event) => setShiftValue(event.target.value)} /></label>
          <label>Receita particular (R$)<input type="number" min="0" step="100" value={privateRevenue} onChange={(event) => setPrivateRevenue(event.target.value)} /></label>
          <label>Despesas profissionais (R$)<input type="number" min="0" step="100" value={expenses} onChange={(event) => setExpenses(event.target.value)} /></label>
        </div>
        <div className="income-result"><div><span>Recebimentos brutos</span><strong>{formatMoneyExact(gross)}</strong></div><div><span>Após despesas profissionais</span><strong>{formatMoneyExact(afterExpenses)}</strong></div></div>
        <p className="income-disclaimer">Cálculo aritmético, antes de impostos e contribuições. Receita de consultório não equivale a salário ou lucro pessoal.</p>
      </div>
    </div>
  </section>;
}

function RegionChart({ data }: { data: DashboardData }) {
  const rows = regions.map((name) => ({ name, value: Number(metric(data, "specialist_region_share", name)?.value ?? 0) }));
  return (
    <section className="chart-card" aria-labelledby="regions-heading">
      <div className="chart-heading"><div><h3 id="regions-heading">Especialistas por região</h3><p>Participação no total nacional · DMB 2025</p></div><span className="evidence-tag">Dado relatado</span></div>
      <div className="chart-canvas" role="img" aria-label={rows.map((r) => `${r.name}: ${r.value}%`).join("; ")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 2, right: 39, bottom: 0, left: 2 }} barCategoryGap={16}>
            <CartesianGrid horizontal={false} stroke="#e8eef3" />
            <XAxis type="number" domain={[0, 60]} tickLine={false} axisLine={false} tick={{ fill: "#81909f", fontSize: 11 }} tickFormatter={(value: number) => `${value}%`} />
            <YAxis type="category" dataKey="name" width={92} tickLine={false} axisLine={false} tick={{ fill: "#425369", fontSize: 12 }} />
            <Tooltip cursor={{ fill: "#f4f8fc" }} formatter={(value) => [`${Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`, "Participação"]} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={19} fill="#2563eb"><LabelList dataKey="value" position="right" formatter={(value: unknown) => `${Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`} style={{ fontSize: 11, fill: "#425369" }} /></Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-footnote">Percentual do estoque nacional de especialistas. Não indica a proporção de especialistas dentro de cada região.</p>
    </section>
  );
}

function TrainingChart({ specialties }: { specialties: Specialty[] }) {
  const rows = [2, 3, 4, 5, 6].map((years) => ({ years: `${years} anos`, count: specialties.filter((item) => item.total_training_years === years).length }));
  return (
    <section className="chart-card" aria-labelledby="training-heading">
      <div className="chart-heading"><div><h3 id="training-heading">Tempo total de formação</h3><p>Quantidade de especialidades por duração</p></div><span className="evidence-tag evidence-derived">Calculado do relatório</span></div>
      <div className="chart-canvas" role="img" aria-label={rows.map((r) => `${r.years}: ${r.count} especialidades`).join("; ")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 13, right: 8, bottom: 0, left: -16 }} barCategoryGap={20}>
            <CartesianGrid vertical={false} stroke="#e8eef3" />
            <XAxis dataKey="years" tickLine={false} axisLine={false} tick={{ fill: "#607387", fontSize: 11 }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#81909f", fontSize: 11 }} />
            <Tooltip cursor={{ fill: "#f4f8fc" }} formatter={(value) => [`${value} especialidades`, "Quantidade"]} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={47}>
              {rows.map((row, index) => <Cell key={row.years} fill={index === 1 ? "#2563eb" : "#a7c5ef"} />)}
              <LabelList dataKey="count" position="top" style={{ fill: "#425369", fontSize: 11 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-footnote">Conta as 30 especialidades deste painel. Duração pode variar por programa e deve ser conferida no edital.</p>
    </section>
  );
}

function HoursChart({ specialties }: { specialties: Specialty[] }) {
  const items = specialties.slice(0, 6);
  const low = 25;
  const span = 50;
  return (
    <section className="hours-card" aria-labelledby="hours-heading">
      <div className="chart-heading"><div><h3 id="hours-heading">Carga semanal após residência</h3><p>Faixas estimadas das primeiras áreas da lista filtrada</p></div><span className="evidence-tag evidence-analytic">Estimativa analítica</span></div>
      <div className="range-axis"><span>25h</span><span>50h</span><span>75h</span></div>
      <div className="range-rows">
        {items.map((item) => (
          <div className="range-row" key={item.slug}>
            <span title={item.name}>{item.name}</span>
            <div className="range-track"><i style={{ left: `${Math.max(0, (item.weekly_hours_min - low) / span * 100)}%`, width: `${(item.weekly_hours_max - item.weekly_hours_min) / span * 100}%` }} /></div>
            <strong>{item.weekly_hours_min}–{item.weekly_hours_max}h</strong>
          </div>
        ))}
      </div>
      <p className="chart-footnote">Faixas construídas para comparação, não médias oficiais. Múltiplos vínculos podem elevar a carga.</p>
    </section>
  );
}

function CostChart({ costs }: { costs: CostScenario[] }) {
  const rows = costs.map((item) => ({
    name: `Classe ${item.class_code}`,
    value: Number(item.monthly_fixed_min_brl) / 1000,
    range: item.monthly_fixed_max_brl === null ? `a partir de ${formatMoney(Number(item.monthly_fixed_min_brl))}` : `${formatMoney(Number(item.monthly_fixed_min_brl))}–${formatMoney(Number(item.monthly_fixed_max_brl))}`,
    description: item.structure,
  }));
  return <section className="chart-card cost-card" aria-labelledby="cost-heading">
    <div className="chart-heading"><div><h3 id="cost-heading">Custo fixo mensal de consultório</h3><p>Piso de quatro cenários indicativos em Salvador · R$ mil</p></div><span className="evidence-tag evidence-analytic">Cenário analítico</span></div>
    <div className="cost-layout">
      <div className="chart-canvas" role="img" aria-label={rows.map((row) => `${row.name}: piso de ${formatMoney(row.value * 1000)} por mês`).join("; ")}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 2, right: 28, bottom: 0, left: 2 }} barCategoryGap={17}>
            <CartesianGrid horizontal={false} stroke="#e8eef3" />
            <XAxis type="number" domain={[0, 80]} tickLine={false} axisLine={false} tick={{ fill: "#81909f", fontSize: 11 }} tickFormatter={(value: number) => `${value} mil`} />
            <YAxis type="category" dataKey="name" width={72} tickLine={false} axisLine={false} tick={{ fill: "#425369", fontSize: 11 }} />
            <Tooltip cursor={{ fill: "#f4f8fc" }} formatter={(value) => [formatMoney(Number(value) * 1000), "Piso mensal"]} />
            <Bar dataKey="value" fill="#55a6bb" radius={[0, 4, 4, 0]} maxBarSize={19}><LabelList dataKey="value" position="right" formatter={(value: unknown) => `${Number(value)} mil`} style={{ fontSize: 11, fill: "#425369" }} /></Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="cost-legend">{rows.map((row) => <div key={row.name}><strong>{row.name}</strong><span>{row.description}</span><small>{row.range}</small></div>)}</div>
    </div>
    <p className="chart-footnote">Faixas indicativas de custo fixo, sem imóvel, pró-labore, impostos ou financiamento. O limite superior da classe D é aberto.</p>
  </section>;
}

function SpecialtyTable({ specialties, selected, toggle }: { specialties: Specialty[]; selected: string[]; toggle: (slug: string) => void }) {
  return (
    <>
    <div className="table-scroll">
      <table className="specialty-table">
        <thead><tr><th>Especialidade</th><th>Formação</th><th>Horas/sem.</th><th>Absorção*</th><th>Telemedicina*</th><th>IA: tarefas*</th><th><span className="sr-only">Comparar</span></th></tr></thead>
        <tbody>
          {specialties.map((item) => {
            const added = selected.includes(item.slug);
            const disabled = selected.length >= maxCompare && !added;
            return <tr key={item.slug} className={added ? "row-selected" : ""}>
              <td><strong>{item.name}</strong><small>{item.work_settings}</small></td>
              <td><span className="number">{item.total_training_years} anos</span><small>{item.prerequisite === "clinica_medica" ? "após Clínica Médica" : item.prerequisite === "cirurgia_geral" ? "após Cirurgia Geral" : "acesso direto"}</small></td>
              <td className="number">{item.weekly_hours_min}–{item.weekly_hours_max}h</td>
              <td><span className="status-text">{item.market_absorption_proxy}</span></td>
              <td>{item.telemedicine_potential}</td>
              <td>{item.ai_task_exposure}</td>
              <td><button type="button" className={`row-action ${added ? "row-action-active" : ""}`} onClick={() => toggle(item.slug)} disabled={disabled} aria-pressed={added} aria-label={`${added ? "Remover" : "Adicionar"} ${item.name} ${added ? "da" : "à"} comparação`} title={disabled ? "Remova uma das três áreas para adicionar outra." : undefined}>{added ? <Check size={16} /> : <Plus size={16} />}</button></td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
    <div className="specialty-cards" aria-label="Especialidades encontradas">
      {specialties.map((item) => {
        const added = selected.includes(item.slug);
        const disabled = selected.length >= maxCompare && !added;
        return <article className={`specialty-card ${added ? "specialty-card-selected" : ""}`} key={item.slug}>
          <div className="specialty-card-head"><div><h3>{item.name}</h3><p>{item.work_settings}</p></div><button type="button" className={`row-action ${added ? "row-action-active" : ""}`} onClick={() => toggle(item.slug)} disabled={disabled} aria-pressed={added} aria-label={`${added ? "Remover" : "Adicionar"} ${item.name} ${added ? "da" : "à"} comparação`}>{added ? <Check size={17} /> : <Plus size={17} />}</button></div>
          <div className="specialty-card-grid"><div><span>Formação total</span><strong>{item.total_training_years} anos</strong><small>{item.prerequisite === "clinica_medica" ? "após Clínica Médica" : item.prerequisite === "cirurgia_geral" ? "após Cirurgia Geral" : "acesso direto"}</small></div><div><span>Horas semanais*</span><strong>{item.weekly_hours_min}–{item.weekly_hours_max}h</strong></div></div>
          <div className="specialty-card-facts"><span>Absorção*</span><strong>{item.market_absorption_proxy}</strong><span>Telemedicina*</span><strong>{item.telemedicine_potential}</strong><span>IA: tarefas*</span><strong>{item.ai_task_exposure}</strong><span>Potencial particular*</span><strong>{item.private_revenue_potential}</strong></div>
        </article>;
      })}
    </div>
    </>
  );
}

function Comparison({ selected, incomeSurveys, inflationIndex, remove, clear }: { selected: Specialty[]; incomeSurveys: DashboardData["specialtyIncomeSurveys"]; inflationIndex: DashboardData["inflationIndex"]; remove: (slug: string) => void; clear: () => void }) {
  const latestIncome = new Map<string, DashboardData["specialtyIncomeSurveys"][number]>();
  [...incomeSurveys].sort((a, b) => b.reference_year - a.reference_year).forEach((row) => { if (row.specialty_slug && !latestIncome.has(row.specialty_slug)) latestIncome.set(row.specialty_slug, row); });
  const rows: { label: string; value: (item: Specialty) => string }[] = [
    { label: "Formação total", value: (item) => `${item.total_training_years} anos` },
    { label: "Carga semanal estimada", value: (item) => `${item.weekly_hours_min}–${item.weekly_hours_max}h` },
    { label: "Qualidade de vida potencial", value: (item) => item.quality_of_life_potential },
    { label: "Absorção de mercado", value: (item) => item.market_absorption_proxy },
    { label: "Telemedicina", value: (item) => item.telemedicine_potential },
    { label: "Exposição de tarefas à IA", value: (item) => item.ai_task_exposure },
    { label: "Capital próprio necessário", value: (item) => item.capital_requirement },
    { label: "Equivalente mensal pelo IPCA", value: (item) => { const row = latestIncome.get(item.slug); const factor = row ? inflationFactorForYear(inflationIndex, row.reference_year) : null; return row && factor ? `${formatMoney(Number(row.mean_net_monthly_brl) * factor)} · base ${row.reference_year}` : "Sem média publicada"; } },
  ];
  return (
    <section id="comparar" className="compare-section">
      <div className="section-header"><div><span className="section-overline">Decisão lado a lado</span><h2>Comparar especialidades</h2><p>Selecione até três áreas na tabela. A comparação preserva as unidades e as ausências do relatório.</p></div>{selected.length > 0 && <button type="button" className="subtle-button" onClick={clear}>Limpar seleção</button>}</div>
      {selected.length === 0 ? (
        <div className="compare-empty"><div className="compare-empty-icon"><Plus size={22} /></div><div><strong>Sua comparação começa na tabela.</strong><p>Adicione as áreas que você consideraria exercer no dia a dia.</p></div><a href="#especialidades">Explorar especialidades <ArrowRight size={16} /></a></div>
      ) : (
        <div className="comparison-scroll"><div className="comparison-grid" style={{ gridTemplateColumns: `170px repeat(${selected.length}, minmax(205px, 1fr))` }}>
          <div className="comparison-corner">Critério</div>
          {selected.map((item) => <div className="comparison-title" key={item.slug}><strong>{item.name}</strong><button type="button" aria-label={`Remover ${item.name}`} onClick={() => remove(item.slug)}><X size={16} /></button></div>)}
          {rows.map((row) => <div className="comparison-row" key={row.label}><span>{row.label}</span>{selected.map((item) => <strong key={item.slug}>{row.value(item)}</strong>)}</div>)}
        </div></div>
      )}
      <p className="evidence-note">* Absorção, telemedicina, exposição à IA, carga pós-residência e qualidade de vida são avaliações ou estimativas analíticas. “Não especificado” não equivale a zero.</p>
    </section>
  );
}

export function Dashboard({ data }: { data: DashboardData }) {
  const [query, setQuery] = useState("");
  const [training, setTraining] = useState("all");
  const [demand, setDemand] = useState("all");
  const [sort, setSort] = useState<Sort>("name");
  const [selected, setSelected] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const filtered = useMemo(() => [...data.specialties].filter((item) => {
    const matchesQuery = !query || normalize(`${item.name} ${item.work_settings} ${item.career_paths}`).includes(normalize(query.trim()));
    const matchesTraining = training === "all" || (training === "direct" ? !item.prerequisite : item.prerequisite === training);
    const matchesDemand = demand === "all" || item.market_absorption_proxy === demand;
    return matchesQuery && matchesTraining && matchesDemand;
  }).sort((a, b) => sort === "years" ? a.total_training_years - b.total_training_years || a.name.localeCompare(b.name, "pt-BR") : sort === "hours" ? a.weekly_hours_max - b.weekly_hours_max || a.name.localeCompare(b.name, "pt-BR") : a.name.localeCompare(b.name, "pt-BR")), [data.specialties, query, training, demand, sort]);

  const selectedItems = selected.map((slug) => data.specialties.find((item) => item.slug === slug)).filter((item): item is Specialty => Boolean(item));
  const specialistCount = metric(data, "specialist_physicians");
  const stipend = metric(data, "resident_monthly_stipend_gross");
  const hasFilters = Boolean(query) || training !== "all" || demand !== "all";

  function toggle(slug: string) { setSelected((current) => current.includes(slug) ? current.filter((item) => item !== slug) : current.length < maxCompare ? [...current, slug] : current); }
  function reset() { setQuery(""); setTraining("all"); setDemand("all"); setSort("name"); }

  return <div className="dashboard-shell">
    <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
    <main className="main-content" id="visao-geral">
      <div className="page-topline"><span>PAINEL DE CARREIRA MÉDICA</span><span className="data-source"><Database size={14} /> {data.source === "supabase" ? "Dados do Supabase" : "Cópia local dos dados"}</span></div>
      <div className="page-heading"><div><h1>Explore sua próxima especialidade.</h1><p>Uma visão comparável sobre formação, rotina e mercado para decidir com mais contexto.</p></div><a href="#especialidades" className="heading-action">Explorar áreas <ArrowDownRight size={18} /></a></div>
      {data.warning && <div className="warning-banner" role="status"><Info size={17} />{data.warning}</div>}

      <section className="metrics-section" aria-label="Indicadores principais">
        <MetricCard icon={GraduationCap} label="Especialidades analisadas" value={String(data.specialties.length)} detail="Áreas da pesquisa" />
        <MetricCard icon={Clock3} label="Tempo de formação" value="2–6 anos" detail="Conforme a especialidade" />
        <MetricCard icon={MapPinned} label="Especialistas no Brasil" value={specialistCount ? `${(Number(specialistCount.value) / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil` : "N/E"} detail="dezembro de 2024 · relatório" />
        <MetricCard icon={Database} label="Bolsa-base mensal" value={stipend ? formatMoneyExact(Number(stipend.value)) : "N/E"} detail="valor bruto · referência 2026" />
      </section>

      <IncomeSection data={data} />
      <MonthlyIncome specialties={data.specialties} surveys={data.specialtyIncomeSurveys} inflationIndex={data.inflationIndex} inflationSource={data.inflationSource} regions={data.incomeRegions} />
      <FormalIncome specialties={data.specialties} rows={data.formalJobBenchmarks} />
      <ServiceEarnings specialties={data.specialties} benchmarks={data.serviceBenchmarks} />

      <section className="charts-section" aria-labelledby="data-heading">
        <div className="section-header"><div><span className="section-overline">Contexto em números</span><h2 id="data-heading">O que os dados mostram</h2><p>Gráficos com medidas disponíveis. Sem simular renda ou empregabilidade.</p></div></div>
        <div className="chart-grid"><RegionChart data={data} /><TrainingChart specialties={data.specialties} /></div>
        <HoursChart specialties={filtered} />
        <CostChart costs={data.costs} />
      </section>

      <section className="explorer-section" id="especialidades" aria-labelledby="specialties-heading">
        <div className="section-header"><div><span className="section-overline">Explore as possibilidades</span><h2 id="specialties-heading">Especialidades</h2><p>Filtre as áreas, veja o perfil de trabalho e leve até três para comparação.</p></div><span className="result-count">{filtered.length} de {data.specialties.length} áreas</span></div>
        <div className="filter-bar">
          <label className="search-field"><span className="sr-only">Buscar especialidade, ambiente ou caminho</span><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar especialidade, ambiente ou caminho" /></label>
          <label><span className="sr-only">Formação</span><select value={training} onChange={(event) => setTraining(event.target.value)}><option value="all">Formação: todas</option><option value="direct">Acesso direto</option><option value="clinica_medica">Após Clínica Médica</option><option value="cirurgia_geral">Após Cirurgia Geral</option></select><ChevronDown size={15} aria-hidden="true" /></label>
          <label><span className="sr-only">Absorção de mercado</span><select value={demand} onChange={(event) => setDemand(event.target.value)}><option value="all">Absorção: todas</option><option value="Muito alta">Muito alta*</option><option value="Alta">Alta*</option><option value="Média-alta">Média-alta*</option></select><ChevronDown size={15} aria-hidden="true" /></label>
          <label><span className="sr-only">Ordenar especialidades</span><select value={sort} onChange={(event) => setSort(event.target.value as Sort)}><option value="name">Ordenar: nome</option><option value="years">Menor formação</option><option value="hours">Menor carga máxima*</option></select><ChevronDown size={15} aria-hidden="true" /></label>
          {hasFilters && <button type="button" className="clear-button" onClick={reset}>Limpar</button>}
        </div>
        {filtered.length ? <SpecialtyTable specialties={filtered} selected={selected} toggle={toggle} /> : <div className="no-results"><Search size={25} /><strong>Nenhuma especialidade encontrada</strong><p>Altere a busca ou remova os filtros para ver as 30 áreas.</p><button type="button" onClick={reset}>Limpar filtros</button></div>}
        <p className="table-note">* Avaliações qualitativas ou estimativas do relatório; não são taxas oficiais. A duração deve ser confirmada por programa.</p>
      </section>

      <Comparison selected={selectedItems} incomeSurveys={data.specialtyIncomeSurveys} inflationIndex={data.inflationIndex} remove={toggle} clear={() => setSelected([])} />

      <section className="method-section" id="metodologia"><div className="section-header"><div><span className="section-overline">Transparência</span><h2>Como ler este painel</h2><p>O relatório combina dados publicados, cenários construídos e lacunas que importam para a decisão.</p></div></div><div className="method-cards"><div><span className="method-dot blue" /><h3>Dado relatado</h3><p>A Afya publicou médias de renda líquida total declarada para nove áreas em 2022–2023. A RAIS 2025 acrescenta medianas de um vínculo formal para 29 áreas. São medidas diferentes. O IPCA atualiza o poder de compra das médias Afya.</p></div><div><span className="method-dot teal" /><h3>Estimativa analítica</h3><p>Os ajustes de mercado, região, experiência e jornada são hipóteses escolhidas pelo usuário. Faixas de horas, absorção, IA e qualidade de vida descrevem tendências, sem precisão estatística.</p></div><div><span className="method-dot gray" /><h3>Não especificado</h3><p>As demais 21 áreas não têm média individual de renda líquida total publicada nas pesquisas consultadas. A mediana formal não preenche essa lacuna. Medicina de Emergência ainda não aparece no recorte RAIS 2025 com código próprio.</p></div></div></section>

      <footer className="page-footer"><span>Med · Pesquisa organizada para escolha de residência</span><span>{formatNumber(data.specialties.length)} áreas · dados de referência 2022–2026</span></footer>
    </main>
  </div>;
}
