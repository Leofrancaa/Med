"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Info } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { IncomeRegionContext, IpcaIndex, Specialty, SpecialtyIncomeSurvey } from "@/lib/data";
import { inflationFactorForYear } from "@/lib/inflation";

const sourceUrls: Record<number, string> = {
  2023: "https://uploads.production.portal.marketing.afya.systems/wp-content/uploads/2024/06/12191704/Relatorio_Panoramica_Saude-Financeira-do-Medico-2023_05.2024_Divulgacao.pdf",
  2022: "https://img.pebmed.com.br/wp-content/uploads/2023/04/24141645/Relatorio_Panorama-Financeiro-do-Medico-2022_04.2023.pdf",
};
const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);

export function MonthlyIncome({ specialties, surveys, inflationIndex, inflationSource, regions }: { specialties: Specialty[]; surveys: SpecialtyIncomeSurvey[]; inflationIndex: IpcaIndex[]; inflationSource: "ibge" | "supabase" | "snapshot"; regions: IncomeRegionContext[] }) {
  const [slug, setSlug] = useState("cardiologia");
  const [adjustments, setAdjustments] = useState({ market: "0", region: "0", career: "0", hours: "" });
  const inflation = useMemo(() => {
    const last = inflationIndex.at(-1);
    const factors = new Map<number, number>();
    if (last) for (const year of [2022, 2023]) {
      const factor = inflationFactorForYear(inflationIndex, year);
      if (factor !== null) factors.set(year, factor);
    }
    return { last, factors };
  }, [inflationIndex]);
  const corrected = (row: SpecialtyIncomeSurvey) => Number(row.mean_net_monthly_brl) * (inflation.factors.get(row.reference_year) ?? 1);
  const referenceMonth = inflation.last ? new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${inflation.last.month}T12:00:00Z`)) : "sem índice";
  const latest = useMemo(() => {
    const lookup = new Map<string, SpecialtyIncomeSurvey>();
    [...surveys].sort((a, b) => b.reference_year - a.reference_year).forEach((row) => {
      if (row.specialty_slug && !lookup.has(row.specialty_slug)) lookup.set(row.specialty_slug, row);
    });
    return lookup;
  }, [surveys]);
  const ordered = useMemo(() => [...specialties].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")), [specialties]);
  const chart = [...latest.entries()].map(([key, row]) => ({
    name: specialties.find((item) => item.slug === key)?.name ?? key,
    value: corrected(row),
    year: row.reference_year,
  })).sort((a, b) => b.value - a.value);
  const selected = ordered.find((item) => item.slug === slug) ?? ordered[0];
  const selectedRows = surveys.filter((row) => row.specialty_slug === selected?.slug).sort((a, b) => b.reference_year - a.reference_year);
  const current = selectedRows[0];
  const surgicalGroup = surveys.find((row) => row.id === "2023-grupo-cirurgico");
  const factor = current ? inflation.factors.get(current.reference_year) : undefined;
  const adjustedValue = current && factor ? corrected(current) : null;
  const modifiers = (["market", "region", "career"] as const).map((key) => 1 + Math.min(100, Math.max(-50, Number(adjustments[key]) || 0)) / 100);
  const reportedHours = Number(current?.mean_weekly_hours ?? 0);
  const plannedHours = adjustments.hours === "" ? reportedHours : Math.min(100, Math.max(10, Number(adjustments.hours) || reportedHours));
  const scenario = adjustedValue === null ? null : adjustedValue * modifiers.reduce((value, modifier) => value * modifier, 1) * (reportedHours > 0 ? plannedHours / reportedHours : 1);

  function changeAdjustment(key: keyof typeof adjustments, value: string) {
    setAdjustments((current) => ({ ...current, [key]: value }));
  }

  return <section className="monthly-income-section" id="renda-por-especialidade" aria-labelledby="monthly-income-heading">
    <div className="section-header"><div><h2 id="monthly-income-heading">Renda mensal por especialidade</h2><p>O poder de compra atual da média líquida declarada nas pesquisas Afya de 2022 e 2023.</p></div><span className="evidence-tag">IPCA até {referenceMonth}</span></div>
    <div className="monthly-income-note"><Info size={17} aria-hidden="true" /><p>Há média individual publicada para <strong>{latest.size} das {specialties.length} especialidades</strong> deste painel. As demais aparecem como “sem média publicada”. O grupo cirúrgico foi pesquisado em conjunto e não permite estimar cada área.</p></div>
    <div className="monthly-income-layout">
      <div className="monthly-income-main">
        <div className="monthly-income-select"><label htmlFor="monthly-income-specialty">Escolha a especialidade</label><select id="monthly-income-specialty" value={selected?.slug ?? ""} onChange={(event) => setSlug(event.target.value)}>{ordered.map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></div>
        <div className="monthly-income-selected"><span>Equivalente mensal pelo IPCA · {referenceMonth}</span><strong>{adjustedValue === null ? "Sem média publicada" : money(adjustedValue)}</strong><p>{current ? `Média observada: ${money(Number(current.mean_net_monthly_brl))} em ${current.reference_year} · n=${current.respondent_count} · ${Number(current.mean_weekly_hours).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}h/semana. Correção: +${(((factor ?? 1) - 1) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%.` : "Não encontramos uma média individual de renda líquida mensal para esta área nas pesquisas consultadas."}</p>{current && <a href={current.source_url ?? sourceUrls[current.reference_year]} target="_blank" rel="noopener noreferrer">Abrir relatório de origem <ArrowUpRight size={14} /></a>}</div>
        <div className="monthly-income-scenario"><div className="monthly-income-scenario-head"><h3>Outros fatores</h3><span className="evidence-tag evidence-analytic">Cenário ajustável</span></div><p>A pesquisa informa a jornada média de cada grupo. Região, experiência e mudanças reais no mercado não têm efeito isolado medido por especialidade; ajuste conforme seu contexto.</p><div className="monthly-income-adjustments"><label>Mudança real do mercado (%)<input type="number" min="-50" max="100" step="1" value={adjustments.market} onChange={(event) => changeAdjustment("market", event.target.value)} /></label><label>Mercado local (%)<input type="number" min="-50" max="100" step="1" value={adjustments.region} onChange={(event) => changeAdjustment("region", event.target.value)} /></label><label>Experiência profissional (%)<input type="number" min="-50" max="100" step="1" value={adjustments.career} onChange={(event) => changeAdjustment("career", event.target.value)} /></label><label>Jornada planejada (h/sem.)<input type="number" min="10" max="100" step="1" value={adjustments.hours} placeholder={reportedHours ? `${reportedHours}h na pesquisa` : "Sem base"} onChange={(event) => changeAdjustment("hours", event.target.value)} /></label></div><div className="monthly-income-scenario-result"><span>Resultado do seu cenário</span><strong>{scenario === null ? "Sem base individual" : money(scenario)}</strong></div><small>Jornada em branco usa a média observada. O cálculo supõe renda proporcional às horas e combina os demais ajustes multiplicativamente; é uma hipótese, não uma nova média estatística.</small></div>
        {selectedRows.length > 1 && <div className="monthly-income-history"><span>Série publicada</span>{selectedRows.map((row) => <div key={row.id}><strong>{row.reference_year}</strong><span>{money(Number(row.mean_net_monthly_brl))}</span><small>n={row.respondent_count}</small></div>)}<p>Diferenças entre os anos refletem amostras distintas e não medem aumento de renda individual.</p></div>}
        {surgicalGroup && <div className="monthly-income-group"><span>Referência de grupo · corrigida pelo IPCA</span><strong>{money(corrected(surgicalGroup))}/mês</strong><p>Grupo de Cirurgia, Oftalmologia, Otorrinolaringologia e Urologia (n={surgicalGroup.respondent_count} em 2023). Não representa a média de cada área.</p></div>}
      </div>
      <div className="monthly-income-chart-panel"><h3>Equivalente atual das médias publicadas</h3><p>Correção monetária pelo IPCA até {referenceMonth}; Dermatologia usa base de 2022.</p><div className="monthly-income-chart" role="img" aria-label={chart.map((row) => `${row.name}: ${money(row.value)} em valores de ${referenceMonth}, base ${row.year}`).join("; ")}><ResponsiveContainer width="100%" height="100%"><BarChart data={chart} layout="vertical" margin={{ top: 4, right: 58, bottom: 4, left: 2 }} barCategoryGap={9}><CartesianGrid horizontal={false} stroke="#edf2f6" /><XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#8696a6", fontSize: 10 }} tickFormatter={(value: number) => `${Math.round(value / 1000)} mil`} /><YAxis type="category" dataKey="name" width={144} tickLine={false} axisLine={false} tick={{ fill: "#415870", fontSize: 10 }} tickFormatter={(value: string) => value === "Medicina de Família e Comunidade" ? "Med. Família" : value === "Ginecologia e Obstetrícia" ? "Ginec. e Obst." : value === "Endocrinologia e Metabologia" ? "Endocrinologia" : value} /><Tooltip cursor={{ fill: "#f4f8fc" }} formatter={(value) => [money(Number(value)), `Equivalente pelo IPCA · ${referenceMonth}`]} /><Bar dataKey="value" fill="#3b72d4" radius={[0, 4, 4, 0]} maxBarSize={22} /></BarChart></ResponsiveContainer></div><div className="monthly-income-region"><h4>Contexto regional da pesquisa</h4><p>Média líquida de todos os participantes por região em 2023, sem separar especialidades.</p><div>{regions.map((region) => <span key={region.region}><strong>{region.region}</strong><b>{money(Number(region.mean_net_monthly_brl))}</b><small>n={region.respondent_count}</small></span>)}</div><small>Diferenças agregadas não são percentuais aplicáveis automaticamente à área selecionada. Fonte: <a href={sourceUrls[2023]} target="_blank" rel="noopener noreferrer">Afya 2023, gráfico 53</a>.</small></div></div>
    </div>
    <div className="monthly-income-table-wrap"><table className="monthly-income-table"><caption>Renda mensal nas 30 especialidades · equivalente em {referenceMonth}</caption><thead><tr><th>Especialidade</th><th>Equivalente IPCA</th><th>Média observada</th><th>Ano</th><th>Horas/sem.</th><th>Amostra</th></tr></thead><tbody>{ordered.map((item) => { const row = latest.get(item.slug); return <tr key={item.slug} className={item.slug === slug ? "monthly-income-active" : ""}><td><button type="button" onClick={() => setSlug(item.slug)}>{item.name}</button></td><td>{row ? money(corrected(row)) : <span className="monthly-income-missing">Sem média publicada</span>}</td><td>{row ? money(Number(row.mean_net_monthly_brl)) : "—"}</td><td>{row?.reference_year ?? "—"}</td><td>{row ? Number(row.mean_weekly_hours).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : "—"}</td><td>{row ? `n=${row.respondent_count}` : "—"}</td></tr>; })}</tbody></table></div>
    <p className="monthly-income-footnote">O valor pelo IPCA preserva poder de compra; não mede quanto médicos recebem hoje. Usamos a média dos 12 números-índice mensais do ano da pesquisa e o último índice publicado ({referenceMonth}). Fonte do índice: <a href="https://sidra.ibge.gov.br/tabela/1737" target="_blank" rel="noopener noreferrer">IBGE/SIDRA, tabela 1737, variável 2266</a> ({inflationSource === "ibge" ? "série atualizada" : inflationSource === "supabase" ? "cópia no Supabase" : "cópia local"}).</p>
    <p className="monthly-income-footnote">A pesquisa online recrutou médicos nas bases da Afya; valores autodeclarados e sujeitos a viés de seleção. Amostras pequenas em algumas áreas. Região, experiência, jornada e forma de atuação podem alterar a renda, mas não há coeficientes por especialidade para ajustar a média com confiança. Fontes: <a href={sourceUrls[2023]} target="_blank" rel="noopener noreferrer">Afya 2023, gráficos 41, 53 e 59</a>; <a href={sourceUrls[2022]} target="_blank" rel="noopener noreferrer">Afya 2022, gráficos 52 e 55</a>.</p>
  </section>;
}
