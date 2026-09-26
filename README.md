# Med

Dashboard interativo para estudantes brasileiros compararem especialidades de residência. Feito com Next.js, TypeScript, Tailwind CSS, Recharts e Supabase.

## Rodar localmente

Requer Node.js 20.19 ou superior.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Preencha `.env.local` com a URL do projeto e a chave **publicável** do Supabase. Sem elas, o painel exibe as cópias em `data/dashboard-data.json` e `data/service-benchmarks.json` e informa isso na interface. A senha do banco e a chave secreta não são necessárias na aplicação.

## Banco de dados

Execute `supabase/schema.sql` e depois `supabase/seed.sql` no projeto Supabase. Para atualizar um banco existente, execute as migrações ausentes em `supabase/migrations/`. A carga é repetível. As cinco tabelas têm RLS e leitura pública, apropriada para os dados expostos neste painel:

| Tabela | Registros | Uso |
|---|---:|---|
| `specialties` | 30 | Formação, rotina e avaliações qualitativas |
| `clinic_cost_scenarios` | 4 | Cenários indicativos de consultório em Salvador |
| `market_indicators` | 15 | Indicadores com ano, localidade, unidade e classe de evidência |
| `income_benchmarks` | 1 | Exemplo de salário bruto de edital, com jornada e fonte |
| `specialty_service_benchmarks` | 61 | Mediana de valor informado por ato TUSS, CBO, amostra, período e fonte |

Os CSVs e JSONs em `data/` servem para revisão e desenvolvimento. O aplicativo consulta as cinco tabelas pela Data API do Supabase a cada requisição e usa os JSONs locais quando a conexão falha.

## Qualidade dos dados

O material de origem é `deep-research-report.md`, fornecido pelo usuário. As referências `turn...` do relatório são marcadores internos, sem URL pública verificável. Confirme as fontes primárias antes de tratar qualquer número como validado externamente.

As faixas de horas, absorção de mercado, telemedicina, qualidade de vida e exposição de tarefas à IA são estimativas ou avaliações analíticas. O relatório não fornece renda total comparável, taxa de emprego ou burnout por especialidade; o painel não infere esses valores. Durações de residência devem ser conferidas nos editais dos programas.

A seção de renda acrescenta um dado primário externo ao relatório: o [edital nacional Ebserh 01/2026](https://conhecimento.fgv.br/sites/default/files/concursos/edital-no-02-area-medica-edital-retificado-1-30.01.2026.pdf) anuncia R$ 11.464,35 brutos mensais para cargos de médico especialista com 24 horas semanais. É um exemplo de vínculo, não uma média nacional ou por especialidade. O simulador combina apenas valores informados pelo usuário; seu resultado após despesas não desconta tributos ou contribuições.

### Valores por atendimento

`data/service-benchmarks.json` foi derivado dos arquivos abertos [TISS ambulatorial da ANS, Bahia, dezembro de 2025](https://dadosabertos.ans.gov.br/FTP/PDA/TISS/AMBULATORIAL/2025/BA/), tabelas `CONS` e `DET`, ligados por `ID_EVENTO_ATENCAO_SAUDE`. O CBO do evento identifica a ocupação registrada, mas não comprova qual profissional executou o ato. Foram selecionados códigos TUSS da tabela 22 clinicamente pertinentes à área, com remuneração não preestabelecida, fora de pacotes e de tabelas próprias, quantidade positiva e valor unitário informado entre R$ 0 e R$ 5.000. O valor exibido é a **mediana do valor informado por item**, e `sample_size` conta registros, não médicos. Exigimos ao menos 20 registros para consulta/procedimento e 10 para intervenção ambulatorial. A coluna técnica `cirurgia_intervencao` identifica atos invasivos ambulatoriais, como suturas pequenas, bloqueios e exérese de lesões. Na interface, ela é rotulada "Intervenções ambulatoriais". Cirurgias hospitalares aparecem separadamente e sem valor observado, para que o usuário informe um valor contratual próprio na simulação.

Há 28 áreas com alguma referência, 21 com procedimento e 12 com cirurgia/intervenção. Medicina de Emergência e Patologia não têm referência adequada neste recorte. Dados ausentes aparecem como ausentes. O valor informado pela rede **não é o honorário, repasse ou renda do médico** e não representa o mercado particular ou outras UFs. O simulador multiplica valor por ato, volume mensal e percentual de repasse informado pelo usuário, descontando as despesas que ele informar. É um cenário antes de impostos, não previsão de renda. Para todos os detalhes de campos, consulte o [dicionário de variáveis TISS da ANS](https://dadosabertos.ans.gov.br/FTP/PDA/TISS/DICIONARIO/).

## Implantação

Conecte este repositório a um projeto Vercel com framework Next.js. Configure somente:

```text
NEXT_PUBLIC_SUPABASE_URL=https://rxwciwkcfkmnbzslpcmu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<chave publicável do projeto>
```

Essas variáveis são usadas no servidor Next.js para leitura pública. Nunca adicione a senha do banco, `service_role` ou chave secreta ao repositório ou a uma variável `NEXT_PUBLIC_*`.

Verificação local: `npm run lint` e `npm run build`.
