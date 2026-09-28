# Renda mensal por especialidade

O arquivo [`specialty-income-surveys.json`](specialty-income-surveys.json) transcreve duas pesquisas primárias do Afya Research Center. A tabela `public.specialty_income_surveys` guarda a mesma série no Supabase. Cada registro representa a média de renda líquida mensal **autodeclarada** pelos participantes de uma especialidade principal, no ano de referência. `respondent_count` é o número de respostas daquele recorte; não é o total de médicos da área no Brasil.

| Relatório | Gráfico | Ano da renda | Amostra total da pesquisa | URL |
| --- | ---: | ---: | ---: | --- |
| Saúde Financeira do Médico em 2023 | 59, p. 110 | 2023 | 2.624 | https://uploads.production.portal.marketing.afya.systems/wp-content/uploads/2024/06/12191704/Relatorio_Panoramica_Saude-Financeira-do-Medico-2023_05.2024_Divulgacao.pdf |
| Panorama Financeiro do Médico em 2022 | 52, p. 84 | 2022 | 3.184 | https://img.pebmed.com.br/wp-content/uploads/2023/04/24141645/Relatorio_Panorama-Financeiro-do-Medico-2022_04.2023.pdf |

O relatório de 2023 publica médias individuais para oito especialidades presentes no dashboard: Medicina Intensiva, Cardiologia, Ginecologia e Obstetrícia, Psiquiatria, Pediatria, Endocrinologia, Clínica Médica e Medicina de Família e Comunidade. O de 2022 acrescenta Dermatologia. As outras 21 áreas continuam sem média individual publicada nesses relatórios. O valor agregado de 2023 para especialidades cirúrgicas reúne Cirurgia, Oftalmologia, Otorrinolaringologia e Urologia; o valor de 2022 para “Cirurgião” também é agregado. Nenhum deles é atribuído a uma especialidade isolada. A coluna `mean_weekly_hours` transcreve a jornada média dos mesmos grupos, dos gráficos 41 (2023, p. 76) e 55 (2022, p. 87).

Os valores são nominais, sem correção monetária para 2026. A coleta foi online, por convite a bases e ferramentas da Afya, e pode ter viés de seleção. As amostras por área são pequenas em alguns casos, como Medicina Intensiva (n=37). A margem de erro calculada para a amostra total não deve ser aplicada a cada média por especialidade. Mudanças entre 2022 e 2023 usam amostras diferentes, portanto não mostram evolução individual de renda.

**Medidas que não devem ser misturadas:** salário bruto de um edital se refere a um vínculo e uma jornada; valor de consulta ou procedimento registrado pela ANS se refere ao ato faturado; renda líquida autodeclarada se refere ao ganho mensal do médico. A Demografia Médica no Brasil 2025 apresenta R$ 36.818 mensais em declarações de IRPF de 2022 para médicos em geral, sem recorte por especialidade, e inclui categorias de rendimentos que não equivalem à renda líquida do exercício profissional. Fonte: https://amb.org.br/wp-content/uploads/2025/04/DEMOGRAFIA-MEDICA-DO-BRASIL-2025_versao-online.pdf

## Equivalente pelo IPCA

O dashboard lê o número-índice mensal do IPCA (IBGE/SIDRA, tabela 1737, variável 2266) e mantém uma cópia em `data/ipca-index-monthly.json` e `public.ipca_index_monthly`. A fonte oficial é consultada novamente pelo servidor a cada dia; se estiver indisponível, vale a última cópia. O mês usado aparece junto aos valores. Em 26/09/2026, o último índice publicado é agosto de 2026, 7.633,23. Fonte: https://sidra.ibge.gov.br/tabela/1737

Como a Afya perguntou pela **média mensal ao longo de um ano**, a base de correção é a média aritmética dos 12 números-índice desse ano. A fórmula é `média publicada × (índice do último mês / média dos índices do ano da pesquisa)`. Com agosto de 2026 como destino, os fatores são 1,19857190 para 2022 e 1,14593276 para 2023 (respectivamente +19,86% e +14,59%). Arredondamos só para exibição. O resultado preserva aproximadamente o poder de compra; **não é uma observação de renda em 2026** nem incorpora ganho real, mudança na oferta de médicos ou contratos.

## Outros fatores

O relatório de 2023 analisa diferenças por região, idade, grau de formação e jornada, mas não publica um modelo conjunto com coeficientes por especialidade. O gráfico 53 (p. 97) registra média de R$ 25.518 no Norte (n=140), R$ 24.975 no Centro-Oeste (n=193), R$ 23.198 no Nordeste (n=491), R$ 22.895 no Sul (n=444) e R$ 22.212 no Sudeste (n=1.206) para todos os médicos da amostra. Essas diferenças não são coeficientes regionais para uma especialidade específica.

O painel permite hipóteses de mudança real do mercado, mercado local e experiência profissional (cada percentual entre -50% e +100%). A jornada planejada pode ser informada em horas semanais (10 a 100); em branco, usa a jornada média publicada para a área. `Cenário = equivalente IPCA × (1 + mercado/100) × (1 + região/100) × (1 + experiência/100) × (jornada planejada/jornada observada)`. O último fator **supõe proporcionalidade de renda e horas**, sem confirmação causal na pesquisa. O resultado é hipótese de planejamento, não média estatística nem previsão individual.

## Remuneração de vínculo formal (RAIS 2025)

O arquivo [`formal-job-rais-2025.json`](formal-job-rais-2025.json) reúne a **mediana salarial mensal** de dezembro de 2025 de um vínculo formal com 40 a 44 horas semanais em cada ocupação médica correspondente à área do painel. Ele registra CBO, número de vínculos e quartis (25% recebem até; 25% acima de). A origem é a RAIS 2025 do Ministério do Trabalho e Emprego, publicada por ocupação pela plataforma 99K. Cada linha traz a URL específica para auditoria; o extrator reproduzível está em [`../scripts/extract-rais-formal.py`](../scripts/extract-rais-formal.py). Fonte oficial da base: https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/estatisticas-trabalho/rais/rais-2025/rais-2025 . Exemplo do recorte: https://99k.com.br/carreiras/medico-cardiologista .

Esta medida **não é média nem renda total de um médico**. Ela não soma vínculos, trabalho como PJ ou autônomo, consultas privadas nem honorários cirúrgicos; é nominal e anterior a impostos. A CBO é ocupação informada pelo empregador e não confirma Registro de Qualificação de Especialista. A especialidade “Hematologia e Hemoterapia” usa somente o CBO de hematologista, sem combinar hemoterapeuta. A RAIS de dezembro de 2025 cobre 29 das 30 áreas; Medicina de Emergência recebeu o CBO próprio 2251-57 somente em maio de 2026, conforme https://portal.abramede.com.br/noticia/atuacao-do-medico-emergencista-e-incluida-no-rol-da-classificacao-brasileira-de-ocupacoes . Não atribuímos um CBO anterior como substituto.

Os recortes Afya e RAIS ficam em seções separadas. A existência de um salário formal para uma área não permite preencher a média de renda líquida total que falta nas pesquisas Afya.
