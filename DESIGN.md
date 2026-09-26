---
version: alpha
name: "Med"
description: "Painel limpo de dados para estudantes brasileiros escolherem residência médica."
colors:
  primary: "#2563EB"
  background: "#F7F9FC"
  surface: "#FFFFFF"
  text: "#142238"
  muted: "#68798B"
  line: "#E4EBF2"
  focus: "#89B4FF"
typography:
  display:
    fontFamily: "Manrope, Arial, sans-serif"
  body:
    fontFamily: "Inter, Arial, sans-serif"
rounded:
  DEFAULT: "0.5rem"
spacing:
  page-max: "90rem"
components:
  chart: {}
  metric: {}
  filter: {}
  comparison: {}
---

# Med Design System

## Purpose

O painel ajuda estudantes de medicina a explorar a duração da formação, a rotina e o contexto de mercado de 30 especialidades. Os gráficos mostram medidas sustentadas pelo relatório; estimativas e avaliações qualitativas são marcadas explicitamente. Nenhum número ausente vira zero ou taxa implícita.

## Visual direction

Interface de análise clara: fundo cinza quase branco, superfícies brancas, texto azul escuro e azul apenas para navegação e dados relatados. Verde água distingue intervalos analíticos. Espaço livre e linhas suaves organizam a densidade, sem ornamentos médicos. A primeira tela contém os indicadores essenciais e dois gráficos legíveis.

## Type and layout

Manrope para títulos e valores principais; Inter para texto e controles. Valores numéricos usam alinhamento tabular. Barra lateral compacta no desktop; navegação no topo em telas pequenas. As seções seguem visão geral, gráficos, exploração, comparação e metodologia. A tabela pode rolar horizontalmente em celular para preservar campos e unidades.

## Components and states

- Cartões de indicadores: rótulo, valor e referência temporal ou unidade.
- Gráficos: título, subtítulo, valores, classe de evidência e nota de interpretação junto ao gráfico.
- Filtros: busca e seletores nativos com rótulos acessíveis; estado vazio oferece limpeza.
- Tabela: botão explícito para adicionar até três áreas à comparação.
- Comparação: mesma linguagem, unidade e ausência de dado da tabela; remoção individual e limpeza geral.
- Falha de consulta: faixa visível informa que a cópia local está em uso.

Controles possuem foco visível. Cores complementam rótulos, nunca substituem valores. O movimento fica restrito a transições discretas e respeita a preferência de movimento reduzido.

## Renda e celular

A seção de renda diferencia visualmente o valor de um edital, as médias líquidas autodeclaradas por especialidade com ano e amostra, seu equivalente em poder de compra pelo IPCA e os cenários ajustados pelo usuário. A ausência de média individual permanece explícita. Em celular, as especialidades viram cartões com todos os critérios e um botão de comparação de 40px; a tabela de renda permite rolagem horizontal.

## Data integrity

Distribuição regional e bolsa são dados relatados pela pesquisa. O histograma de formação é calculado das 30 áreas. Faixas de carga semanal, potencial de qualidade de vida, absorção, telemedicina e exposição de tarefas à IA são avaliações analíticas; não são taxas oficiais. As pesquisas Afya cobrem individualmente nove das 30 áreas do painel, em 2022–2023. A média do grupo cirúrgico permanece separada das especialidades. As demais áreas não recebem valor inferido.
