# Renda mensal por especialidade

O arquivo [`specialty-income-surveys.json`](specialty-income-surveys.json) transcreve duas pesquisas primárias do Afya Research Center. A tabela `public.specialty_income_surveys` guarda a mesma série no Supabase. Cada registro representa a média de renda líquida mensal **autodeclarada** pelos participantes de uma especialidade principal, no ano de referência. `respondent_count` é o número de respostas daquele recorte; não é o total de médicos da área no Brasil.

| Relatório | Gráfico | Ano da renda | Amostra total da pesquisa | URL |
| --- | ---: | ---: | ---: | --- |
| Saúde Financeira do Médico em 2023 | 59, p. 110 | 2023 | 2.624 | https://uploads.production.portal.marketing.afya.systems/wp-content/uploads/2024/06/12191704/Relatorio_Panoramica_Saude-Financeira-do-Medico-2023_05.2024_Divulgacao.pdf |
| Panorama Financeiro do Médico em 2022 | 52, p. 84 | 2022 | 3.184 | https://img.pebmed.com.br/wp-content/uploads/2023/04/24141645/Relatorio_Panorama-Financeiro-do-Medico-2022_04.2023.pdf |

O relatório de 2023 publica médias individuais para oito especialidades presentes no dashboard: Medicina Intensiva, Cardiologia, Ginecologia e Obstetrícia, Psiquiatria, Pediatria, Endocrinologia, Clínica Médica e Medicina de Família e Comunidade. O de 2022 acrescenta Dermatologia. As outras 21 áreas continuam sem média individual publicada nesses relatórios. O valor agregado de 2023 para especialidades cirúrgicas reúne Cirurgia, Oftalmologia, Otorrinolaringologia e Urologia; o valor de 2022 para “Cirurgião” também é agregado. Nenhum deles é atribuído a uma especialidade isolada.

Os valores são nominais, sem correção monetária para 2026. A coleta foi online, por convite a bases e ferramentas da Afya, e pode ter viés de seleção. As amostras por área são pequenas em alguns casos, como Medicina Intensiva (n=37). A margem de erro calculada para a amostra total não deve ser aplicada a cada média por especialidade. Mudanças entre 2022 e 2023 usam amostras diferentes, portanto não mostram evolução individual de renda.

**Medidas que não devem ser misturadas:** salário bruto de um edital se refere a um vínculo e uma jornada; valor de consulta ou procedimento registrado pela ANS se refere ao ato faturado; renda líquida autodeclarada se refere ao ganho mensal do médico. A Demografia Médica no Brasil 2025 apresenta R$ 36.818 mensais em declarações de IRPF de 2022 para médicos em geral, sem recorte por especialidade, e inclui categorias de rendimentos que não equivalem à renda líquida do exercício profissional. Fonte: https://amb.org.br/wp-content/uploads/2025/04/DEMOGRAFIA-MEDICA-DO-BRASIL-2025_versao-online.pdf
