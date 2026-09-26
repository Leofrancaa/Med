# Med

Dashboard interativo para estudantes brasileiros compararem especialidades de residência. Feito com Next.js, TypeScript, Tailwind CSS, Recharts e Supabase.

## Rodar localmente

Requer Node.js 20.19 ou superior.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Preencha `.env.local` com a URL do projeto e a chave **publicável** do Supabase. Sem elas, o painel exibe a cópia dos dados em `data/dashboard-data.json` e informa isso na interface. A senha do banco e a chave secreta não são necessárias na aplicação.

## Banco de dados

Execute `supabase/schema.sql` e depois `supabase/seed.sql` no projeto Supabase. Para atualizar um banco criado antes da seção de renda, execute `supabase/migrations/20260926_income_benchmarks.sql`. A carga é repetível. As quatro tabelas têm RLS e leitura pública, apropriada para os dados expostos neste painel:

| Tabela | Registros | Uso |
|---|---:|---|
| `specialties` | 30 | Formação, rotina e avaliações qualitativas |
| `clinic_cost_scenarios` | 4 | Cenários indicativos de consultório em Salvador |
| `market_indicators` | 15 | Indicadores com ano, localidade, unidade e classe de evidência |
| `income_benchmarks` | 1 | Exemplo de salário bruto de edital, com jornada e fonte |

Os CSVs e o JSON em `data/` servem para revisão e desenvolvimento. O aplicativo consulta as quatro tabelas pela Data API do Supabase a cada requisição e usa o JSON local quando a conexão falha.

## Qualidade dos dados

O material de origem é `deep-research-report.md`, fornecido pelo usuário. As referências `turn...` do relatório são marcadores internos, sem URL pública verificável. Confirme as fontes primárias antes de tratar qualquer número como validado externamente.

As faixas de horas, absorção de mercado, telemedicina, qualidade de vida e exposição de tarefas à IA são estimativas ou avaliações analíticas. O relatório não fornece renda total comparável, taxa de emprego ou burnout por especialidade; o painel não infere esses valores. Durações de residência devem ser conferidas nos editais dos programas.

A seção de renda acrescenta um dado primário externo ao relatório: o [edital nacional Ebserh 01/2026](https://conhecimento.fgv.br/sites/default/files/concursos/edital-no-02-area-medica-edital-retificado-1-30.01.2026.pdf) anuncia R$ 11.464,35 brutos mensais para cargos de médico especialista com 24 horas semanais. É um exemplo de vínculo, não uma média nacional ou por especialidade. O simulador combina apenas valores informados pelo usuário; seu resultado após despesas não desconta tributos ou contribuições.

## Implantação

Conecte este repositório a um projeto Vercel com framework Next.js. Configure somente:

```text
NEXT_PUBLIC_SUPABASE_URL=https://rxwciwkcfkmnbzslpcmu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<chave publicável do projeto>
```

Essas variáveis são usadas no servidor Next.js para leitura pública. Nunca adicione a senha do banco, `service_role` ou chave secreta ao repositório ou a uma variável `NEXT_PUBLIC_*`.

Verificação local: `npm run lint` e `npm run build`.
