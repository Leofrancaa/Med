# Med — produto

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js, TypeScript, Tailwind CSS, Supabase e Vercel, conforme pedido do usuário.

## Users

Estudantes de medicina no Brasil que estão escolhendo a especialidade de residência. O relatório dedica atenção especial a decisões de quem considera viver na Bahia.

## Product Purpose

Permitir comparar especialidades por formação, rotina, demanda qualitativa, telemedicina, exposição de tarefas à IA e barreira de capital. Uma decisão bem-sucedida identifica opções coerentes com a rotina e o local onde o estudante pretende trabalhar.

## Operating Context

O usuário explora 30 especialidades e pode consultar cenários de custo de consultório para Salvador. Parte das informações é avaliação analítica do relatório; os indicadores de contexto usam marcadores de citação internos ainda sem URLs de origem verificadas.

## Capabilities and Constraints

- Pesquisa e filtros das especialidades; comparação lado a lado; indicadores de contexto com escopo e classe de evidência visíveis.
- Interface em português do Brasil, adaptada a celular e desktop.
- Leitura pública do banco Supabase com RLS; alterações de dados são administrativas e não fazem parte do dashboard.
- Não inventar renda média, taxa de emprego, nota de corte comparável, prazo até contratação ou burnout por especialidade. Um edital com salário bruto e jornada pode servir de exemplo de vínculo, desde que sua origem e seus limites apareçam juntos.
- Custos de consultório são cenários analíticos de Salvador em valores nominais de 2026, sem imóvel, pró-labore, impostos e financiamento.
- Nunca colocar a senha do banco no repositório nem no cliente web.

## Evidence on Hand

- Relatório de pesquisa fornecido pelo usuário: `deep-research-report.md` (fora do repositório).
- Dados extraídos em `data/`, com SQL reproduzível em `supabase/`.
- Os marcadores `turn...` preservados nos dados não são URLs públicas nem validação independente.

## Product Principles

1. Mostrar primeiro os fatores que o estudante pode comparar de forma honesta.
2. Indicar claramente quando um campo é avaliação qualitativa ou estimativa.
3. Manter ausências como ausências, nunca como zero.
4. Facilitar leitura de rotina e formação antes de sugerir qualquer ranking.
