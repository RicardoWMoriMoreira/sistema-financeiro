# Funcionalidades para o Usuário Final

Este documento descreve as funcionalidades disponíveis para quem utiliza o sistema financeiro no dia a dia e explica o objetivo de cada uma.

## 1. Acesso e Conta

### Cadastro de usuário
**Objetivo:** permitir que cada pessoa tenha sua própria conta, com dados financeiros separados e seguros.

- Criar conta com nome, e-mail e senha.
- Validação de senha mínima e confirmação de senha.
- Redirecionamento para login após cadastro com mensagem de sucesso.

### Login e sessão
**Objetivo:** garantir acesso seguro aos dados pessoais e proteger as informações financeiras do usuário.

- Login por e-mail e senha.
- Mensagens de erro para credenciais inválidas e falha de conexão.
- Logout com retorno para tela de login.

## 2. Navegação e Experiência de Uso

**Objetivo:** facilitar o uso diário do sistema, tornando as ações rápidas, claras e confortáveis.

- Menu principal com acesso às áreas: Dashboard, Transações, Recorrentes, Categorias, Metas e Orçamento.
- Identificação visual da seção ativa no menu.
- Alternância entre tema claro e escuro.
- Mensagens de feedback (sucesso/erro/informação) após ações importantes.
- Registro de service worker para suporte a experiência tipo PWA.

## 3. Dashboard Financeiro

### Indicadores principais
**Objetivo:** oferecer uma visão geral imediata da saúde financeira sem precisar abrir vários relatórios.

- Total de receitas.
- Total de despesas.
- Saldo consolidado.
- Quantidade de transações cadastradas.
- Quantidade de categorias cadastradas.

### Visualizações e análise
**Objetivo:** ajudar o usuário a identificar padrões, excessos e oportunidades de melhoria financeira.

- Gráfico comparativo de receitas vs despesas.
- Gráfico de despesas por categoria.
- Gráfico de evolução financeira (receitas, despesas e saldo) ao longo do tempo.
- Seleção de período para análise da evolução (ex.: últimos meses, ano, acumulado).

### Visões rápidas
**Objetivo:** destacar pontos de atenção e atalhos para as tarefas mais frequentes.

- Lista das 5 transações mais recentes.
- Resumo de metas (ativas, concluídas, progresso e valor acumulado).
- Alertas de orçamento com destaque para categorias em atenção/excedidas.
- Bloco de ações rápidas para navegar direto para tarefas frequentes.

## 4. Gestão de Transações

### Cadastro de transações
**Objetivo:** registrar com precisão todas as entradas e saídas para manter o controle financeiro atualizado.

- Criar receita ou despesa.
- Informar descrição, valor, data e categoria.
- Definir forma de pagamento (cartão de crédito, cartão de débito, dinheiro, pix).
- Definir perfil de custo (fixo ou variável).
- Informar data de vencimento.
- Marcar status de pagamento (pago ou a pagar).
- Definir número de parcelas (1 a 360).

### Parcelamento e grupos de parcelas
**Objetivo:** controlar compras parceladas de forma prática, evitando perda de controle sobre compromissos futuros.

- Registro de transações parceladas com número da parcela e total de parcelas.
- Edição individual de uma parcela.
- Edição em lote de todas as parcelas de um mesmo grupo.
- Ação para marcar um grupo inteiro de parcelas como pago.
- Ação para excluir todas as parcelas de um grupo.

### Listagem, busca e filtros
**Objetivo:** permitir encontrar rapidamente qualquer lançamento, mesmo com grande volume de dados.

- Busca por descrição.
- Filtro por tipo (receita/despesa).
- Filtro por categoria.
- Filtro por status de pagamento.
- Filtro por intervalo de datas.
- Filtros rápidos: últimos 7 dias, mês atual e ano atual.
- Limpeza rápida de todos os filtros.

### Organização e produtividade
**Objetivo:** reduzir tempo de operação e facilitar manutenção dos dados financeiros.

- Ordenação por descrição, categoria, tipo, data e valor.
- Paginação da listagem de transações.
- Edição inline (direto na tabela).
- Exclusão de transações com confirmação.

### Importação e exportação
**Objetivo:** integrar dados de outras fontes e facilitar compartilhamento/arquivo de informações.

- Importação de transações via arquivo CSV.
- Upload por seleção de arquivo ou arrastar e soltar.
- Preview das primeiras linhas antes de confirmar a importação.
- Relatório de sucesso/erro após importação.
- Exportação de transações para CSV com base nos filtros aplicados.
- Geração de relatório em PDF com base nos filtros aplicados.

## 5. Transações Recorrentes

### Cadastro de recorrências
**Objetivo:** automatizar lançamentos repetitivos para evitar retrabalho e manter consistência dos registros.

- Criar receitas/despesas recorrentes com:
  - descrição;
  - valor;
  - tipo;
  - categoria;
  - frequência (diária, semanal, mensal, anual);
  - data inicial;
  - data final opcional.

### Operação de recorrências
**Objetivo:** dar controle sobre o ciclo de lançamentos automáticos e evitar cobranças/receitas fora de contexto.

- Visualizar recorrências em tabela (incluindo próxima ocorrência e status).
- Ativar ou desativar recorrências.
- Excluir recorrências.
- Processar recorrências pendentes para gerar transações automaticamente.
- Opção de transformar uma transação comum em recorrente no próprio formulário de transações.

## 6. Gestão de Categorias

**Objetivo:** organizar receitas e despesas em grupos claros para melhorar análise e tomada de decisão.

- Criar categorias de receita e despesa.
- Editar nome e tipo da categoria.
- Excluir categoria com confirmação.
- Visualizar todas as categorias em tabela organizada.

## 7. Gestão de Orçamento Mensal

### Configuração de orçamento
**Objetivo:** definir limites de gasto por categoria para prevenir excessos ao longo do mês.

- Definir limite de gastos por categoria de despesa.
- Escolher mês de referência para o orçamento.
- Criar múltiplos orçamentos mensais por categoria.

### Acompanhamento do orçamento
**Objetivo:** monitorar consumo em tempo real e agir antes que os limites sejam ultrapassados.

- Visualizar limite total do mês.
- Visualizar total gasto.
- Visualizar quantidade de orçamentos excedidos.
- Ver consumo por categoria (gasto, restante e percentual utilizado).
- Status visual por categoria:
  - OK;
  - Atenção (próximo do limite);
  - Excedido.
- Excluir orçamento quando necessário.

## 8. Gestão de Metas Financeiras

### Criação de metas
**Objetivo:** transformar objetivos financeiros em metas mensuráveis com prazo e progresso.

- Criar meta com nome, tipo, valor-alvo, valor inicial e prazo.
- Tipos de meta:
  - economia;
  - controle de gastos.

### Acompanhamento de metas
**Objetivo:** acompanhar evolução contínua, reforçar disciplina financeira e medir resultados.

- Visualizar resumo geral:
  - total de metas;
  - metas ativas;
  - metas concluídas;
  - progresso geral.
- Visualizar cada meta com:
  - progresso percentual;
  - valor atual;
  - valor alvo;
  - valor restante;
  - dias restantes até o prazo;
  - status da meta (ativa, concluída, não alcançada).
- Atualizar o valor atual da meta para acompanhar evolução.
- Excluir metas.

## 9. Observações Gerais de Uso

**Objetivo do sistema como um todo:** centralizar o controle financeiro pessoal em um único ambiente e apoiar decisões com dados claros.

- As funcionalidades de filtros, gráficos e resumos permitem análise rápida para apoiar decisões financeiras do usuário.

## 10. Explicações em Linguagem Simples (o que e, para que serve e como usar)

### Transacoes recorrentes
**O que e:** transacoes recorrentes sao transacoes que se repetem automaticamente em um intervalo de tempo (por exemplo: aluguel mensal, salario mensal, assinatura semanal).

**Para que usar:** para nao ter que cadastrar manualmente os mesmos lancamentos todos os meses e reduzir esquecimentos.

**Como usar:**
- Entre na area `Recorrentes`.
- Clique em criar nova recorrencia.
- Informe descricao, valor, tipo (receita/despesa), categoria, frequencia e data inicial.
- Quando quiser gerar os lancamentos pendentes, use o botao de processar recorrencias.
- Se nao quiser mais usar, desative ou exclua a recorrencia.

### Transacoes
**O que e:** transacoes sao os registros de tudo o que entra (receita) e sai (despesa) do seu dinheiro.

**Para que usar:** para ter controle real do fluxo financeiro e saber onde o dinheiro esta sendo ganho e gasto.

**Como usar:**
- Sempre que receber ou gastar, registre uma nova transacao.
- Preencha valor, data, categoria e, se necessario, vencimento e status de pagamento.
- Use os filtros para localizar rapidamente lancamentos especificos.

### Categorias
**O que e:** categorias sao grupos para organizar transacoes (ex.: Alimentacao, Moradia, Transporte, Salario).

**Para que usar:** para entender com clareza em quais areas voce mais gasta e de onde vem sua receita.

**Como usar:**
- Crie categorias antes de registrar muitas transacoes.
- Use categorias diferentes para despesas e receitas.
- Revise e ajuste categorias quando sua rotina financeira mudar.

### Orcamento mensal
**O que e:** orcamento mensal e um limite de gasto por categoria para um mes especifico.

**Para que usar:** para evitar gastar alem do planejado e acompanhar limites de forma preventiva.

**Como usar:**
- Defina um limite para cada categoria de despesa (ex.: Alimentacao = R$ 800).
- Acompanhe os alertas de atencao e excedido.
- Ajuste habitos ou limites quando perceber que uma categoria estourou.

### Metas financeiras
**O que e:** metas financeiras sao objetivos com valor e prazo (ex.: juntar R$ 5.000 para viagem).

**Para que usar:** para transformar planos em objetivos mediveis e acompanhar seu progresso.

**Como usar:**
- Crie a meta com nome, valor alvo e prazo.
- Atualize periodicamente o valor atual alcançado.
- Use o progresso para decidir quanto precisa guardar por mes.

### Dashboard
**O que e:** dashboard e o painel principal com resumo, graficos e alertas financeiros.

**Para que usar:** para ter uma visao rapida da sua situacao sem precisar abrir varias telas.

**Como usar:**
- Consulte receitas, despesas e saldo logo no inicio.
- Veja graficos para identificar tendencias.
- Use os atalhos do painel para acessar as acoes mais comuns.

### Importacao e exportacao
**O que e:** importacao permite trazer dados de arquivo CSV; exportacao gera relatorios em CSV ou PDF.

**Para que usar:** para acelerar cadastro em massa e compartilhar/arquivar informacoes.

**Como usar:**
- Use importacao quando tiver historico em planilhas.
- Revise o preview antes de confirmar.
- Use exportacao com filtros aplicados para gerar relatorios mais objetivos.
