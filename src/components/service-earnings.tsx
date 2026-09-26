"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Calculator, Info } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ServiceBenchmark, Specialty } from "@/lib/data";

const categories = [
  { id: "consulta", label: "Consultas", singular: "Consulta", color: "#3b72d4" },
  { id: "procedimento", label: "Procedimentos", singular: "Procedimento", color: "#24a49a" },
  { id: "cirurgia_intervencao", label: "Intervenções ambulatoriais", singular: "Intervenção ambulatorial", color: "#db9558" },
  { id: "cirurgia_hospitalar", label: "Cirurgia hospitalar", singular: "Cirurgia hospitalar", color: "#8b79bd" },
] as const;

const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 }).format(value);
const number = (value: number) => new Intl.NumberFormat("pt-BR").format(value);
const amount = (value: string) => Math.max(0, Number(value) || 0);

export function ServiceEarnings({ specialties, benchmarks }: { specialties: Specialty[]; benchmarks: ServiceBenchmark[] }) {
  const [slug, setSlug] = useState("dermatologia");
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [volumes, setVolumes] = useState<Record<string, string>>({});
  const [share, setShare] = useState("");
  const [expenses, setExpenses] = useState("0");
  const specialty = specialties.find((item) => item.slug === slug) ?? specialties[0];
  const selected = useMemo(() => benchmarks.filter((item) => item.specialty_slug === specialty?.slug), [benchmarks, specialty?.slug]);
  const rows = categories.map((category) => {
    const benchmark = selected.find((item) => item.category === category.id);
    const key = `${specialty?.slug}:${category.id}`;
    const unitValue = prices[key] ?? (benchmark ? String(benchmark.median_reported_brl) : "");
    const volume = volumes[key] ?? "0";
    return { ...category, benchmark, key, unitValue, volume, monthly: amount(unitValue) * amount(volume) };
  });
  const chartRows = rows.filter((row) => row.benchmark).map((row) => ({ name: row.singular, value: Number(row.benchmark!.median_reported_brl), color: row.color }));
  const grossServiceRevenue = rows.reduce((sum, row) => sum + row.monthly, 0);
  const sharePercent = share === "" ? null : Math.min(100, amount(share));
  const physicianGross = sharePercent === null ? null : grossServiceRevenue * sharePercent / 100;
  const afterExpenses = physicianGross === null ? null : physicianGross - amount(expenses);

  return <section className="service-section" id="producao" aria-labelledby="service-heading">
    <div className="section-header"><div><span className="section-overline">Produção na prática</span><h2 id="service-heading">Quanto vale cada atendimento?</h2><p>Filtre uma área para ver consultas, procedimentos e intervenções ambulatoriais. Para cirurgias hospitalares, use um valor contratual conhecido.</p></div><span className="evidence-tag">ANS · dez/2025 · Bahia</span></div>
    <div className="service-filter"><label htmlFor="service-specialty">Especialidade</label><select id="service-specialty" value={specialty?.slug ?? ""} onChange={(event) => setSlug(event.target.value)}>{[...specialties].sort((a,b) => a.name.localeCompare(b.name,"pt-BR")).map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select><span>{selected.length} {selected.length === 1 ? "ato com referência" : "atos com referência"} neste recorte</span></div>
    <div className="service-layout">
      <div className="service-evidence">
        <div className="service-clarification"><Info size={17} aria-hidden="true" /><p><strong>Estes valores não são o preço de uma cirurgia completa.</strong> Os registros são de atos ambulatoriais isolados; cirurgia hospitalar envolve outros itens, equipe e condições contratuais.</p></div>
        <div className="service-panel-head"><div><h3>Valor informado por ato</h3><p>Mediana dos registros ambulatoriais identificados por CBO.</p></div><span className="evidence-tag">Dado observado</span></div>
        {chartRows.length ? <div className="service-chart" role="img" aria-label={chartRows.map((row) => `${row.name}: ${money(row.value)}`).join("; ")}><ResponsiveContainer width="100%" height="100%"><BarChart data={chartRows} layout="vertical" margin={{ top: 6, right: 12, bottom: 3, left: 3 }} barCategoryGap={23}><CartesianGrid horizontal={false} stroke="#e9eff5" /><XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#8495a5", fontSize: 10 }} tickFormatter={(value: number) => `R$ ${value}`} /><YAxis type="category" dataKey="name" width={116} tickLine={false} axisLine={false} tick={{ fill: "#53687f", fontSize: 11 }} /><Tooltip cursor={{ fill: "#f5f8fc" }} formatter={(value) => [money(Number(value)), "Mediana por ato"]} /><Bar dataKey="value" radius={[0, 5, 5, 0]} maxBarSize={24}>{chartRows.map((row) => <Cell key={row.name} fill={row.color} />)}</Bar></BarChart></ResponsiveContainer></div> : <div className="service-no-data"><Info size={20} /><strong>Sem valores observados neste recorte</strong><p>Você ainda pode montar um cenário com valores próprios abaixo.</p></div>}
        <div className="service-benchmark-list">{rows.map((row) => <div key={row.id} className="service-benchmark-row"><span className="service-marker" style={{ background: row.color }} /><div><strong>{row.label}</strong><small>{row.benchmark ? <>{row.benchmark.service_name} · TUSS {row.benchmark.tuss_code}</> : row.id === "cirurgia_hospitalar" ? "Preço completo e honorário médico indisponíveis nesta base" : "Sem amostra suficiente ou ato representativo"}</small></div><div className="service-benchmark-value"><strong>{row.benchmark ? money(Number(row.benchmark.median_reported_brl)) : "—"}</strong><small>{row.benchmark ? `${number(row.benchmark.sample_size)} registros` : "sem referência"}</small></div></div>)}</div>
      </div>
      <div className="service-simulator">
        <div className="service-panel-head"><div><h3><Calculator size={17} /> Simule seu mês</h3><p>Ajuste o valor por ato e quantas vezes ele ocorre.</p></div><span className="evidence-tag evidence-analytic">Seu cenário</span></div>
        <div className="service-input-head"><span>Tipo de ato</span><span>Valor (R$)</span><span>Atos/mês</span></div>
        {rows.map((row) => <div className="service-input-row" key={row.id}><label htmlFor={`price-${row.id}`}>{row.label}<small>{row.benchmark ? "inicial: mediana ANS" : "valor próprio"}</small></label><input id={`price-${row.id}`} type="number" min="0" step="0.01" inputMode="decimal" placeholder="—" value={row.unitValue} onChange={(event) => setPrices((current) => ({ ...current, [row.key]: event.target.value }))} /><input type="number" min="0" step="1" inputMode="numeric" aria-label={`${row.label}: atos por mês`} value={row.volume} onChange={(event) => setVolumes((current) => ({ ...current, [row.key]: event.target.value }))} /></div>)}
        <div className="service-extra-fields"><label>Repasse ao médico (%)<input type="number" min="0" max="100" step="1" inputMode="numeric" placeholder="Informe %" value={share} onChange={(event) => setShare(event.target.value === "" ? "" : String(Math.min(100, Math.max(0, Number(event.target.value) || 0))))} /></label><label>Despesas profissionais (R$/mês)<input type="number" min="0" step="1" inputMode="decimal" value={expenses} onChange={(event) => setExpenses(event.target.value)} /></label></div>
        <div className="service-total"><div><span>Produção mensal dos atos</span><strong>{money(grossServiceRevenue)}</strong></div><div><span>Recebimento bruto simulado</span><strong>{physicianGross === null ? "Informe o repasse" : money(physicianGross)}</strong></div><div><span>Após despesas informadas</span><strong>{afterExpenses === null ? "—" : money(afterExpenses)}</strong></div></div>
        <p className="service-caveat">Estimativa antes de impostos. O valor do ato registrado pela rede não é o honorário nem o lucro do médico. Para cirurgia hospitalar, informe o valor faturado por cirurgia e o percentual de repasse contratual. Se informar diretamente seu honorário, use repasse de 100%. Não use os valores das intervenções ambulatoriais como preço cirúrgico.</p>
      </div>
    </div>
    <p className="service-source">Fonte: <a href="https://dadosabertos.ans.gov.br/FTP/PDA/TISS/AMBULATORIAL/2025/BA/" target="_blank" rel="noopener noreferrer">ANS, dados abertos TISS ambulatorial, Bahia, dezembro de 2025 <ArrowUpRight size={13} /></a>. Mediana de valor informado por item TUSS, com quantidade positiva, fora de pacotes e tabelas próprias. Seleção de atos representativos; não é média de renda da especialidade nem preço de cirurgia hospitalar.</p>
  </section>;
}
