export type HelpArticle = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  body: string; // supports simple markdown: ## headings, - bullets, **bold**
};

// Help Center content lives in the repo (no CMS). Grouped by category and
// searchable. Covers every area of the platform.
export const HELP_ARTICLES: HelpArticle[] = [
  // ─── Começando ────────────────────────────────────────────────────────────
  {
    slug: "primeiros-passos",
    title: "Primeiros passos no LexLaboral",
    category: "Começando",
    summary: "Do cadastro ao primeiro cálculo e documento em minutos.",
    body: `## Visão geral
O LexLaboral organiza seu escritório trabalhista em torno de **clientes**, **casos**, **cálculos**, **documentos** e **agenda**. O caminho recomendado é: cadastrar o cliente → abrir um caso → fazer o cálculo → gerar documentos → acompanhar audiências e prazos.

## Checklist de primeiros passos
No Painel você verá o card "Primeiros passos". Ele acompanha:
- **Perfil do escritório** — nome, OAB, logo e cor da marca (aparecem nos documentos).
- **Primeiro cliente** — o reclamante da causa.
- **Primeiro caso** — o processo que reúne tudo.
- **Primeiro cálculo** — a liquidação trabalhista.

## Dicas
- Use **Ctrl/Cmd + K** para abrir a busca rápida e navegar ou criar qualquer coisa.
- Passe o mouse sobre os ícones **?** para entender campos jurídicos.
- O botão de ajuda no canto inferior direito reabre o tour e esta Central.`,
  },
  {
    slug: "navegacao-atalhos",
    title: "Navegação e atalhos de teclado",
    category: "Começando",
    summary: "Command palette, busca e atalhos para agilizar o dia a dia.",
    body: `## Command palette (Ctrl/Cmd + K)
Abra de qualquer tela para:
- Criar cálculo, cliente ou caso.
- Ir para qualquer seção.
- Buscar um cliente ou caso pelo nome e abrir direto.

## Menu lateral
Organizado por jornada: Painel, Clientes, Casos, Agenda, Cálculos, Biblioteca (templates) e Configurações.

## Tour de boas-vindas
Aparece no primeiro acesso. Você pode refazê-lo a qualquer momento pelo botão de ajuda.`,
  },
  {
    slug: "perfil-escritorio",
    title: "Configurar o perfil do escritório",
    category: "Começando",
    summary: "Dados que aparecem nos documentos e no portal do cliente.",
    body: `## Por que importa
Nome do escritório, número da OAB, telefone, logo e cor da marca são usados nos **documentos gerados** e na identidade visual do **portal do cliente**.

## Onde configurar
Menu lateral → Perfil. Preencha os dados e faça upload do logo. A cor da marca personaliza botões e destaques.`,
  },

  // ─── Cálculos ───────────────────────────────────────────────────────────────
  {
    slug: "como-fazer-um-calculo",
    title: "Como fazer um cálculo de liquidação",
    category: "Cálculos",
    summary: "Os 4 passos do assistente e o que preencher em cada um.",
    body: `## Os 4 passos
1. **Identificação** — selecione o cliente (reclamante).
2. **Contrato** — datas de admissão e rescisão, tipo de rescisão, aviso prévio e adicionais de risco.
3. **Remuneração** — salários e verbas (13º, férias, horas extras, etc.). Escolha modo simplificado ou histórico salarial mês a mês.
4. **Liquidação** — datas do processo (ajuizamento e liquidação) e alíquotas (INSS patronal, SAT, honorários, dependentes IRPF).

## Preview ao vivo
Enquanto preenche, um valor estimado aparece na tela. O cálculo final aplica correção monetária, juros, INSS, IRPF, custas e honorários.

## Barra de resumo
A partir do passo 3, uma barra fixa mostra cliente, admissão, rescisão e duração, para você não perder o contexto.`,
  },
  {
    slug: "correcao-e-juros",
    title: "Correção monetária e juros (IPCA-E e ADC 58)",
    category: "Cálculos",
    summary: "Como o sistema atualiza os valores até a liquidação.",
    body: `## Correção monetária
Aplicada pelo **IPCA-E** (Súmula 381 do TST), a partir do mês seguinte ao vencimento de cada verba.

## Juros de mora (ADC 58 do STF)
- **TRD** (juros simples) até dezembro/2024.
- **SELIC** acumulada a partir de janeiro/2025.

Cada verba é corrigida do vencimento até a data de liquidação informada.`,
  },
  {
    slug: "atualizar-indices",
    title: "Manter os índices monetários atualizados",
    category: "Cálculos",
    summary: "Cadastre IPCA-E, SELIC e TR mês a mês para o cálculo ficar correto.",
    body: `## Por que importa
A correção e os juros dependem dos índices (IPCA-E, SELIC, TR). Novos meses precisam ser cadastrados para que liquidações recentes fiquem corretas.

## Onde
Configurações → **Índices monetários**. Informe o mês (AAAA-MM) e os valores (mensal e acumulado). Sem cadastro, o sistema usa a tabela interna padrão.

## Dica
Atualize sempre que sair um novo índice oficial (IBGE para IPCA-E, BACEN para SELIC/TR).`,
  },
  {
    slug: "verbas-rescisorias",
    title: "Verbas rescisórias calculadas",
    category: "Cálculos",
    summary: "Aviso prévio, 13º, férias, FGTS, multas e reflexos.",
    body: `## Verbas cobertas
- **Aviso prévio** indenizado (Lei 12.506/2011: 30 dias + 3 por ano, teto 90).
- **13º salário** proporcional (regra dos 15 dias).
- **Férias + 1/3** proporcionais e vencidas em dobro.
- **FGTS** mês a mês + **multa de 40%** (sem justa causa / rescisão indireta).
- **Saldo de salário**, **horas extras**, **adicional noturno**, **insalubridade**, **periculosidade**.
- **Seguro-desemprego** (tabela progressiva).
- **Reflexos** de horas extras/noturno em 13º, férias e FGTS (Súmula 226 do TST).

## Justa causa
Em rescisão por justa causa, o sistema zera automaticamente as verbas não devidas (13º, férias proporcionais, FGTS/multa).`,
  },
  {
    slug: "diferencas-salariais",
    title: "Equiparação salarial e desvio de função",
    category: "Cálculos",
    summary: "Diferenças salariais mês a mês, com reflexos.",
    body: `## Como funciona
No passo Remuneração, ative "Diferenças salariais". Escolha:
- **Equiparação (Art. 461 CLT)** — informe o salário do paradigma.
- **Desvio de função** — informe o valor devido.

Você pode informar o **salário do paradigma** (o sistema calcula a diferença contra o recebido) ou o **valor direto** da diferença.

## Reflexos
Com "gerar reflexos" ativo, a diferença repercute em 13º, férias + 1/3, aviso prévio e FGTS + multa de 40%. As diferenças têm natureza salarial (incidem INSS/IRPF/FGTS).`,
  },
  {
    slug: "art-467-e-477",
    title: "Multas do Art. 467 e Art. 477 da CLT",
    category: "Cálculos",
    summary: "Quando e como cada multa é aplicada.",
    body: `## Art. 477, §8º
Multa de **1 salário** quando as verbas rescisórias não são pagas no prazo legal (até 10 dias corridos da rescisão).

## Art. 467
Acréscimo de **50%** sobre as verbas rescisórias **incontroversas** não pagas na primeira audiência. Aplicamos sobre férias, 13º, aviso prévio e multa de 40% do FGTS — calculado sobre os valores **já corrigidos, sem juros** (mesmo critério da multa de 40%, evitando anatocismo).`,
  },
  {
    slug: "prescricao-quinquenal",
    title: "Prescrição quinquenal",
    category: "Cálculos",
    summary: "Corte de verbas anteriores a 5 anos do ajuizamento.",
    body: `## O que é
Verbas com mais de **5 anos** contados do ajuizamento são atingidas pela prescrição (CF art. 7º, XXIX; STF ARE 709.212 para FGTS).

## Como usar
No passo Liquidação, ative "Aplicar prescrição quinquenal". O cálculo corta o que vier antes da data-limite (FGTS, diferenças salariais e outras verbas mensais).

Fica **desligado por padrão** porque a prescrição não é reconhecida de ofício — é o advogado quem decide arguir.`,
  },
  {
    slug: "outras-verbas",
    title: "Outras verbas e verbas adicionais",
    category: "Cálculos",
    summary: "Verbas customizadas, intervalo intrajornada e transferência.",
    body: `## Outras verbas (nome livre)
No passo Remuneração, adicione verbas com nome livre, valor mensal e período. O sistema multiplica pelos meses, corrige e aplica juros.
- **Salarial** — gera FGTS + multa 40%, INSS/IRPF e reflexos.
- **Indenizatória** — soma apenas o valor corrigido com juros.

## Atalhos (verbas comuns)
Use os atalhos para preencher rapidamente as verbas mais frequentes com a natureza correta: **comissões**, **gratificação de função**, **quinquênio/anuênio**, **sobreaviso** (art. 244 §2), **gorjetas**, **PLR** e **multa normativa** (CCT/ACT). Basta clicar, informar o valor mensal e o período.

## Verbas adicionais de primeira classe
- **Intervalo intrajornada (art. 71 §4 CLT)** — informe as horas/mês suprimidas; pagas com +50% (natureza indenizatória após a Lei 13.467/2017).
- **Adicional de transferência (art. 469 §3)** — informe os meses de transferência provisória; 25% do salário por mês.
- **DSR sobre horas extras (Súm. 172 TST)** — reflexo do repouso semanal sobre horas extras/noturno habituais (ative o interruptor).
- **Estabilidade indenizada** (gestante/CIPA/acidentária) — informe os meses restantes; soma salários + 13º + férias + 1/3 + FGTS do período.

## Abatimentos (liquidação realista)
Informe o **FGTS já depositado** na conta vinculada e as **verbas já pagas (TRCT)** — o sistema abate esses valores do total devido.`,
  },
  {
    slug: "detalhe-do-calculo",
    title: "Entendendo o resultado do cálculo",
    category: "Cálculos",
    summary: "Como ler a liquidação, correção e simular acordo.",
    body: `## Detalhamento
A tela do cálculo mostra cada verba com valor bruto, corrigido, juros e total, com a citação legal correspondente. Blocos colapsáveis detalham FGTS e diferenças mês a mês.

## Ações
- **Gerar documento** a partir do cálculo.
- **Exportar planilha de liquidação (XLSX)** — em Exportar → "Planilha de liquidação". Gera a planilha com verbas (principal/correção/juros/total), descontos (INSS/IRPF) e totais devidos, no formato usado nos processos.
- **Simular acordo** (percentual e parcelas).
- **Compartilhar** por link.
- **Editar** — o cálculo é refeito automaticamente.`,
  },

  // ─── Casos ────────────────────────────────────────────────────────────────
  {
    slug: "casos-visao-geral",
    title: "O caso é o centro de tudo",
    category: "Casos",
    summary: "Como o caso reúne cálculos, documentos, agenda e mais.",
    body: `## O que é um caso
Um caso agrupa **cálculos, documentos, audiências, prazos, acordos, partes, tarefas e andamentos** de um mesmo processo.

## Abas do caso
Cada aba tem seu próprio endereço (deep-link): Visão geral, Cálculos, Acordos, Agenda, Documentos, Notas — além de Partes e Tarefas.

## Fases
Acompanhe o ciclo: pré-judicial → distribuído → conhecimento → recurso → execução → encerrado. Na lista de casos, alterne entre **Lista** e **Kanban** por fase.`,
  },
  {
    slug: "partes-e-envolvidos",
    title: "Partes e envolvidos",
    category: "Casos",
    summary: "Cadastre reclamada, testemunhas, paradigma e mais.",
    body: `## Para que serve
Além do cliente (reclamante), registre a **reclamada** (empresa), **testemunhas**, **paradigma** (equiparação), **perito** e o **advogado da parte contrária**, com contato e observações.

## Onde
Aba "Partes" dentro do caso.`,
  },
  {
    slug: "tarefas-do-caso",
    title: "Tarefas e prazos internos",
    category: "Casos",
    summary: "Organize o que precisa ser feito em cada caso.",
    body: `## To-dos por caso
Crie tarefas com título, descrição, prazo, prioridade e status (pendente, em andamento, concluída).

## Boas práticas
Use tarefas para providências internas (juntar documento, protocolar petição) e a Agenda para audiências e prazos processuais.`,
  },
  {
    slug: "andamentos-processuais",
    title: "Andamentos processuais",
    category: "Casos",
    summary: "Movimentações do processo, manuais ou do tribunal.",
    body: `## Movimentações
Registre andamentos do processo (petições, despachos, decisões, sentença) manualmente, ou sincronize automaticamente pelo número do processo via integração com o tribunal (DataJud/CNJ).

Você recebe alerta quando houver novo andamento.`,
  },
  {
    slug: "financeiro-do-caso",
    title: "Financeiro: honorários e acordos",
    category: "Casos",
    summary: "Contrato de honorários, acordos e valores a receber.",
    body: `## Contrato de honorários
Defina o tipo (percentual, fixo ou de êxito) e o valor da causa.

## Acordos
Registre propostas de acordo, cronograma de parcelas e acompanhe o recebido. O dashboard financeiro consolida a receber e recebido do escritório.`,
  },

  // ─── Documentos ─────────────────────────────────────────────────────────────
  {
    slug: "gerar-documentos",
    title: "Gerar documentos a partir de templates",
    category: "Documentos",
    summary: "Preencha peças automaticamente com os dados do caso.",
    body: `## Como gerar
Na Biblioteca, cada template com arquivo tem o botão de **gerar**. Escolha um cálculo e o documento é preenchido com dados do cálculo, do caso, do cliente e do escritório.

## Pré-visualizar e validar
O botão de **pré-visualização** renderiza o .docx no navegador e mostra um relatório de validação (placeholders válidos, inválidos e obrigatórios faltando).`,
  },
  {
    slug: "templates-e-placeholders",
    title: "Criar e editar templates",
    category: "Documentos",
    summary: "Use seus próprios .docx com placeholders.",
    body: `## Templates próprios
Duplique um template do sistema ou crie um novo e envie um arquivo **.docx** com placeholders no formato **{campo}**.

## Placeholders
Use o botão "Referência de Placeholders" para ver todos os campos disponíveis (cliente, contrato, verbas, liquidação, caso, advogado), com busca e clique-para-copiar. Campos marcados são obrigatórios para o tipo do template.

## Versões
Cada vez que você troca o arquivo, a versão anterior é arquivada.`,
  },

  // ─── Agenda ───────────────────────────────────────────────────────────────
  {
    slug: "agenda-e-prazos",
    title: "Agenda, audiências e prazos",
    category: "Agenda",
    summary: "Todos os compromissos em um só lugar, com lembretes.",
    body: `## Agenda
Reúne audiências e prazos de todos os casos. No Painel, "Próximos compromissos" mostra o que vence nos próximos 14 dias, com atrasados em vermelho.

## Prazos
Prazos podem ser criados a partir de audiências. Você recebe lembretes por e-mail (D-3 e D-1) conforme suas preferências.

## Google Calendar
Conecte sua conta Google para sincronizar audiências e prazos com o seu calendário.`,
  },

  // ─── Clientes e Portal ──────────────────────────────────────────────────────
  {
    slug: "cadastro-de-clientes",
    title: "Cadastrando clientes",
    category: "Clientes",
    summary: "Dados do reclamante e acesso ao portal.",
    body: `## Cadastro
Informe nome, CPF, e-mail e telefone. A partir do cliente você abre casos e faz cálculos.

## Portal
Ative o acesso do cliente ao portal para que ele acompanhe o processo. Mantenha as notificações ativas para atualizações por e-mail.`,
  },
  {
    slug: "portal-do-cliente",
    title: "Portal do cliente",
    category: "Clientes",
    summary: "O que o cliente vê e faz no portal.",
    body: `## O que o cliente acompanha
- **Andamento do processo** em linguagem simples, com uma linha do tempo das etapas.
- **Documentos** — visualizar e enviar.
- **Agenda** de audiências.
- **Valores** do cálculo.
- **Propostas de acordo** — aceitar ou recusar.

## Ações rápidas
O painel do cliente traz atalhos para documentos, valores da causa e processo, além de mostrar em que etapa o processo está (Preparação → Processo iniciado → Em análise → Recurso → Execução → Encerrado).

## Notificações
O cliente recebe avisos quando há novidades (documento aprovado, proposta de acordo, etc.).`,
  },

  // ─── Integrações e ferramentas ──────────────────────────────────────────────
  {
    slug: "busca-rapida",
    title: "Busca rápida (Ctrl/Cmd + K)",
    category: "Ferramentas",
    summary: "Navegue e crie qualquer coisa em segundos.",
    body: `## Command palette
Pressione **Ctrl + K** (ou **Cmd + K** no Mac) de qualquer tela para abrir a busca rápida.

Com ela você pode:
- Criar cálculo, cliente ou caso.
- Ir para qualquer seção do sistema.
- Buscar um cliente ou caso pelo nome e abrir diretamente.`,
  },
  {
    slug: "andamentos-datajud",
    title: "Andamentos automáticos (DataJud/CNJ)",
    category: "Integrações",
    summary: "Puxe as movimentações do processo do tribunal.",
    body: `## Sincronização com o tribunal
Na aba **Andamentos** do caso, clique em "Sincronizar do tribunal" para importar as movimentações processuais direto da API pública do CNJ (DataJud).

Para funcionar, o caso precisa ter o **número do processo (CNJ)** preenchido. A integração cobre a Justiça do Trabalho (TRTs). Você também pode adicionar andamentos manualmente.`,
  },
  {
    slug: "google-calendar",
    title: "Integração com Google Calendar",
    category: "Integrações",
    summary: "Sincronize audiências e prazos com o seu calendário.",
    body: `## Conectar
Em Configurações → Google Calendar, clique em "Conectar Google Calendar" e autorize com a sua conta Google.

## O que sincroniza
Audiências e prazos criados no sistema viram eventos no seu Google Calendar. Você pode ligar/desligar a sincronização de audiências e de prazos separadamente, ou desconectar a qualquer momento.`,
  },
  {
    slug: "prazos-inteligentes",
    title: "Calculadora de prazos",
    category: "Casos",
    summary: "Calcule prazos em dias úteis automaticamente.",
    body: `## Como usar
Na aba **Agenda** do caso, use "Calcular prazo": informe a data da intimação/publicação e o número de dias úteis. O sistema conta pulando fins de semana e feriados nacionais, começando no dia seguinte (regra do art. 775 da CLT / art. 224 do CPC).`,
  },
  {
    slug: "financeiro-honorarios",
    title: "Contrato de honorários",
    category: "Casos",
    summary: "Registre o modelo de cobrança do caso.",
    body: `## Onde
Aba **Financeiro** do caso. Escolha o tipo (percentual, valor fixo ou percentual de êxito) e o percentual/valor.

Se o caso tiver **valor da causa** informado, o sistema mostra o honorário estimado automaticamente.

## Acordos parcelados
Na mesma aba, para cada acordo aceito você gera um **cronograma de parcelas** (informe quantidade e data da 1ª) e marca cada parcela como paga. O sistema divide o valor em parcelas iguais (a última absorve o arredondamento).

## Dashboard financeiro do escritório
No Painel, o card **Financeiro do escritório** consolida: total acordado, recebido, a receber e em atraso, somando todos os acordos aceitos.`,
  },
];

export const HELP_CATEGORIES = [
  ...new Set(HELP_ARTICLES.map((a) => a.category)),
];
