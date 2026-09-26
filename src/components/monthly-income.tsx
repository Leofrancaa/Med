"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Info } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Specialty, SpecialtyIncomeSurvey } from "@/lib/data";

const sourceUrls: Record<number, string> = {
  2023: "https://uploads.production.portal.marketing.afya.systems/wp-content/uploads/2024/06/12191704/Relatorio_Panoramica_Saude-Financeira-do-Medico-2023_05.2024_Divulgacao.pdf",
  2022: "https://img.pebmed.com.br/wp-content/uploads/2023/04/24141645/Relatorio_Panorama-Financeiro-do-Medico-2022_04.2023.pdf",
};
const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);

export function MonthlyIncome({ specialties, surveys }: { specialties: Specialty[]; surveys: SpecialtyIncomeSurvey[] }) {
  const [slug, setSlug] = useState("cardiologia");
  const latest = useMemo(() => {
    const lookup = new Map<string, SpecialtyIncomeSurvey>();
    [...surveys].sort((a, b) => b.reference_year - a.reference_year).forEach((row) => {
      if (row.specialty_slug && !lookup.has(row.specialty_slug)) lookup.set(row.specialty_slug, row);
    });
    return lookup;
  }, [surveys]);
  const ordered = useMemo(() => [...specialties].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")), [specialties]);
  const chart = useMemo(() => [...latest.entries()].map(([key, row]) => ({
    name: specialties.find((item) => item.slug === key)?.name ?? key,
    value: Number(row.mean_net_monthly_brl),
    year: row.reference_year,
  })).sort((a, b) => b.value - a.value), [latest, specialties]);
  const selected = ordered.find((item) => item.slug === slug) ?? ordered[0];
  const selectedRows = surveys.filter((row) => row.specialty_slug === selected?.slug).sort((a, b) => b.reference_year - a.reference_year);
  const current = selectedRows[0];
  const surgicalGroup = surveys.find((row) => row.id === "2023-grupo-cirurgico");

  return <section className="monthly-income-section" id="renda-por-especialidade" aria-labelledby="monthly-income-heading">
    <div className="section-header"><div><h2 id="monthly-income-heading">Renda mensal por especialidade</h2><p>Média líquida declarada por médicos na pesquisa Afya. Valores nominais do ano informado.</p></div><span className="evidence-tag">Pesquisa · 2022–2023</span></div>
    <div className="monthly-income-note"><Info size={17} aria-hidden="true" /><p>Há média individual publicada para <strong>{latest.size} das {specialties.length} especialidades</strong> deste painel. As demais aparecem como “sem média publicada”. O grupo cirúrgico foi pesquisado em conjunto e não permite estimar cada área.</p></div>
    <div className="monthly-income-layout">
      <div className="monthly-income-main">
        <div className="monthly-income-select"><label htmlFor="monthly-income-specialty">Escolha a especialidade</label><select id="monthly-income-specialty" value={selected?.slug ?? ""} onChange={(event) => setSlug(event.target.value)}>{ordered.map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></div>
        <div className="monthly-income-selected"><span>Renda líquida mensal média</span><strong>{current ? money(Number(current.mean_net_monthly_brl)) : "Sem média publicada"}</strong><p>{current ? `${current.reference_year} · ${current.respondent_count} participantes nessa especialidade · valor autodeclarado` : "Não encontramos uma média individual de renda líquida mensal para esta área nas pesquisas consultadas."}</p>{current && <a href={current.source_url ?? sourceUrls[current.reference_year]} target="_blank" rel="noopener noreferrer">Abrir relatório de origem <ArrowUpRight size={14} /></a>}</div>
        {selectedRows.length > 1 && <div className="monthly-income-history"><span>Série publicada</span>{selectedRows.map((row) => <div key={row.id}><strong>{row.reference_year}</strong><span>{money(Number(row.mean_net_monthly_brl))}</span><small>n={row.respondent_count}</small></div>)}<p>Diferenças entre os anos refletem amostras distintas e não medem aumento de renda individual.</p></div>}
        {surgicalGroup && <div className="monthly-income-group"><span>Referência de grupo · 2023</span><strong>{money(Number(surgicalGroup.mean_net_monthly_brl))}/mês</strong><p>Cirurgia, Oftalmologia, Otorrinolaringologia e Urologia juntas (n={surgicalGroup.respondent_count}). Não atribuímos esta média a cada especialidade.</p></div>}
      </div>
      <div className="monthly-income-chart-panel"><h3>Áreas com média individual publicada</h3><p>Último ano disponível por área; Dermatologia usa 2022.</p><div className="monthly-income-chart" role="img" aria-label={chart.map((row) => `${row.name}: ${money(row.value)} em ${row.year}`).join("; ")}><ResponsiveContainer width="100%" height="100%"><BarChart data={chart} layout="vertical" margin={{ top: 4, right: 58, bottom: 4, left: 2 }} barCategoryGap={9}><CartesianGrid horizontal={false} stroke="#edf2f6" /><XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#8696a6", fontSize: 10 }} tickFormatter={(value: number) => `${Math.round(value / 1000)} mil`} /><YAxis type="category" dataKey="name" width={144} tickLine={false} axisLine={false} tick={{ fill: "#415870", fontSize: 10 }} tickFormatter={(value: string) => value === "Medicina de Família e Comunidade" ? "Med. Família" : value === "Ginecologia e Obstetrícia" ? "Ginec. e Obst." : value === "Endocrinologia e Metabologia" ? "Endocrinologia" : value} /><Tooltip cursor={{ fill: "#f4f8fc" }} formatter={(value) => [money(Number(value)), "Média líquida mensal"]} /><Bar dataKey="value" fill="#3b72d4" radius={[0, 4, 4, 0]} maxBarSize={22} /></BarChart></ResponsiveContainer></div></div>
    </div>
    <div className="monthly-income-table-wrap"><table className="monthly-income-table"><caption>Disponibilidade da renda média mensal nas 30 especialidades</caption><thead><tr><th>Especialidade</th><th>Média líquida mensal</th><th>Ano</th><th>Amostra</th></tr></thead><tbody>{ordered.map((item) => { const row = latest.get(item.slug); return <tr key={item.slug} className={item.slug === slug ? "monthly-income-active" : ""}><td><button type="button" onClick={() => setSlug(item.slug)}>{item.name}</button></td><td>{row ? money(Number(row.mean_net_monthly_brl)) : <span className="monthly-income-missing">Sem média publicada</span>}</td><td>{row?.reference_year ?? "—"}</td><td>{row ? `n=${row.respondent_count}` : "—"}</td></tr>; })}</tbody></table></div>
    <p className="monthly-income-footnote">Pesquisa online com recrutamento nas bases da Afya; valores autodeclarados e sujeitos a viés de seleção. Amostras pequenas em algumas áreas. Não são salário de um vínculo, faturamento por procedimento, renda garantida ou valores corrigidos para 2026. Fonte: <a href={sourceUrls[2023]} target="_blank" rel="noopener noreferrer">Afya, Saúde Financeira do Médico em 2023, gráfico 59</a>; <a href={sourceUrls[2022]} target="_blank" rel="noopener noreferrer">Panorama Financeiro 2022, gráfico 52</a>.</p>
  </section>;
}
