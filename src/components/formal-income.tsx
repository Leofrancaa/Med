"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Info } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FormalJobBenchmark, Specialty } from "@/lib/data";

const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
const number = (value: number) => new Intl.NumberFormat("pt-BR").format(value);

export function FormalIncome({ specialties, rows }: { specialties: Specialty[]; rows: FormalJobBenchmark[] }) {
  const [slug, setSlug] = useState("anestesiologia");
  const ordered = useMemo(() => [...specialties].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")), [specialties]);
  const bySlug = useMemo(() => new Map(rows.map((row) => [row.specialty_slug, row])), [rows]);
  const selected = ordered.find((specialty) => specialty.slug === slug) ?? ordered[0];
  const current = bySlug.get(selected?.slug);
  const chart = rows.map((row) => ({
    name: specialties.find((specialty) => specialty.slug === row.specialty_slug)?.name ?? row.specialty_slug,
    value: Number(row.median_monthly_brl),
    count: row.formal_job_count,
  })).sort((a, b) => b.value - a.value).slice(0, 10);

  return <section className="formal-income-section" aria-labelledby="formal-income-heading">
    <div className="section-header"><div><span className="section-overline">Outra medida de remuneração</span><h2 id="formal-income-heading">Salário de um vínculo formal</h2><p>Uma referência adicional para áreas sem pesquisa de renda total, com escopo diferente.</p></div><span className="evidence-tag">RAIS · dez/2025</span></div>
    <div className="formal-income-note"><Info size={17} aria-hidden="true" /><p>Há mediana salarial para <strong>{rows.length} das {specialties.length} áreas</strong> do painel. Ela representa <strong>um vínculo formal de 40 a 44 horas por semana</strong>, antes dos descontos. Não inclui consultório, plantões em outros vínculos, trabalho como PJ ou honorários; por isso não deve ser comparada diretamente à renda líquida total da Afya.</p></div>
    <div className="formal-income-layout">
      <div className="formal-income-selected">
        <label htmlFor="formal-income-specialty">Escolha a especialidade</label>
        <select id="formal-income-specialty" value={selected?.slug ?? ""} onChange={(event) => setSlug(event.target.value)}>{ordered.map((specialty) => <option value={specialty.slug} key={specialty.slug}>{specialty.name}</option>)}</select>
        <span>Mediana mensal · vínculo formal de 40–44 h/semana</span>
        <strong>{current ? money(Number(current.median_monthly_brl)) : "Sem dado comparável"}</strong>
        {current ? <>
          <p>Em dezembro de 2025, metade dos {number(current.formal_job_count)} vínculos desta ocupação recebeu até esse valor; metade recebeu mais.</p>
          <div className="formal-income-quartiles"><span><small>25% recebem até</small><b>{money(Number(current.p25_monthly_brl))}</b></span><span><small>25% recebem acima de</small><b>{money(Number(current.p75_monthly_brl))}</b></span></div>
          <p>Ocupação registrada na CBO {current.cbo_code}. A classificação do vínculo não confirma título de especialista ou RQE.</p>
          {selected.slug === "hematologia-e-hemoterapia" && <p>Este recorte usa apenas a ocupação “médico hematologista”; não combina os vínculos de hemoterapia.</p>}
          <a href={current.source_url} target="_blank" rel="noopener noreferrer">Ver ocupação e dados <ArrowUpRight size={14} /></a>
        </> : <p>Medicina de Emergência recebeu o CBO 2251-57 em 2026, após o fechamento desta RAIS. Ainda não há série comparável para essa ocupação.</p>}
      </div>
      <div className="formal-income-chart-panel"><h3>10 maiores medianas nesta base</h3><p>Ranking restrito aos vínculos formais de 40–44 horas. A tabela abaixo inclui todas as áreas.</p><div className="formal-income-chart" role="img" aria-label={chart.map((row) => `${row.name}: ${money(row.value)}; ${number(row.count)} vínculos`).join("; ")}><ResponsiveContainer width="100%" height="100%"><BarChart data={chart} layout="vertical" margin={{ top: 4, right: 50, bottom: 4, left: 2 }} barCategoryGap={8}><CartesianGrid horizontal={false} stroke="#eaf2f1" /><XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#829a98", fontSize: 10 }} tickFormatter={(value: number) => `${Math.round(value / 1000)} mil`} /><YAxis type="category" dataKey="name" width={145} tickLine={false} axisLine={false} tick={{ fill: "#385e5d", fontSize: 10 }} tickFormatter={(value: string) => value === "Medicina de Família e Comunidade" ? "Med. Família" : value === "Ortopedia e Traumatologia" ? "Ortopedia" : value === "Ginecologia e Obstetrícia" ? "Ginec. e Obst." : value === "Radiologia e Diagnóstico por Imagem" ? "Radiologia" : value} /><Tooltip cursor={{ fill: "#f2f8f7" }} formatter={(value) => [money(Number(value)), "Mediana do vínculo"]} /><Bar dataKey="value" fill="#228f88" radius={[0, 4, 4, 0]} maxBarSize={20} /></BarChart></ResponsiveContainer></div></div>
    </div>
    <div className="formal-income-table-wrap"><table className="formal-income-table"><caption>Remuneração formal nas 30 especialidades · dezembro de 2025</caption><thead><tr><th>Especialidade</th><th>Mediana do vínculo</th><th>25% até</th><th>25% acima de</th><th>Vínculos</th><th>CBO</th></tr></thead><tbody>{ordered.map((specialty) => { const row = bySlug.get(specialty.slug); return <tr key={specialty.slug} className={specialty.slug === slug ? "formal-income-active" : ""}><td><button type="button" onClick={() => setSlug(specialty.slug)}>{specialty.name}</button></td><td>{row ? money(Number(row.median_monthly_brl)) : "Sem dado comparável"}</td><td>{row ? money(Number(row.p25_monthly_brl)) : "—"}</td><td>{row ? money(Number(row.p75_monthly_brl)) : "—"}</td><td>{row ? number(row.formal_job_count) : "—"}</td><td>{row ? <a href={row.source_url} target="_blank" rel="noopener noreferrer">{row.cbo_code}</a> : "—"}</td></tr>; })}</tbody></table></div>
    <p className="formal-income-footnote">Fonte dos recortes por CBO: <a href="https://99k.com.br/carreiras" target="_blank" rel="noopener noreferrer">99K, cálculo sobre a RAIS</a>; <a href="https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/estatisticas-trabalho/rais/rais-2025/rais-2025" target="_blank" rel="noopener noreferrer">Ministério do Trabalho e Emprego, RAIS 2025</a>. Valores nominais de dezembro de 2025, por vínculo formal de 40–44 h/semana. Mediana não é média. A CBO é a ocupação informada pelo empregador, não uma verificação do RQE. <a href="https://portal.abramede.com.br/noticia/atuacao-do-medico-emergencista-e-incluida-no-rol-da-classificacao-brasileira-de-ocupacoes" target="_blank" rel="noopener noreferrer">Código de Medicina de Emergência criado em 2026</a>.</p>
  </section>;
}
