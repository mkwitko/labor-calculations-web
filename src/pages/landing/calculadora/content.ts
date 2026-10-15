/**
 * Conteúdo das páginas de SEO da calculadora pública.
 *
 * Módulo de dados puro, sem JSX e sem import de React: o `scripts/prerender.mjs`
 * o carrega por `vite.ssrLoadModule` dentro do Node para gerar o HTML estático
 * de cada rota. É o mesmo arranjo de `legal/content.ts`, e existe pela mesma
 * razão — o HTML que o Google indexa não pode divergir do que o usuário vê.
 */

export type SeoSection = {
  title: string;
  content: string;
};

export type SeoFaq = {
  question: string;
  answer: string;
};

export type SeoPageContent = {
  slug: string;
  /** Tipo de rescisão que o wizard já abre selecionado, quando cabe. */
  presetTermination?:
    | "sem_justa_causa"
    | "com_justa_causa"
    | "pedido_demissao"
    | "rescisao_indireta";
  /**
   * Qual calculadora a página embute. Ausente é a de rescisão — as três páginas
   * que tratam de saída do emprego. As de verba isolada trazem a sua, porque o
   * wizard de rescisão perguntava sobre demissão a quem ainda está empregado.
   */
  calculator?: "rescisao" | "horas-extras" | "ferias-13";
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  sections: SeoSection[];
  faq: SeoFaq[];
};

export const seoPages: SeoPageContent[] = [
  {
    slug: "rescisao",
    title: "Calculadora de rescisão trabalhista",
    metaTitle: "Calculadora de rescisão trabalhista grátis",
    metaDescription:
      "Calcule quanto você tem a receber na rescisão: saldo de salário, aviso prévio, 13º, férias, FGTS e multa de 40%. Grátis, sem cadastro.",
    intro:
      "Saiu do emprego e não sabe quanto tem a receber? Esta calculadora usa o mesmo motor de cálculo que advogados trabalhistas usam para montar petição: cada verba aparece separada, com o artigo da lei que a sustenta.\n\nO resultado vem como faixa. O valor mais baixo é o que se prova com documento — contracheque, carteira assinada, extrato do FGTS. O mais alto inclui o que depende de prova em processo, como hora extra e adicional de insalubridade. Nenhum dos dois é promessa de recebimento: é estimativa.",
    sections: [
      {
        title: "O que entra em uma rescisão",
        content:
          "Saldo de salário: os dias trabalhados no mês em que você saiu (CLT, arts. 457 e 462).\n\nAviso prévio: 30 dias, mais 3 dias por ano trabalhado, até o teto de 90 (Lei 12.506/2011). Se você não cumpriu trabalhando, ele é indenizado — pago em dinheiro e ainda projeta o contrato para a frente, aumentando férias, 13º e FGTS.\n\n13º salário proporcional: 1/12 por mês trabalhado no ano, contando como mês inteiro a fração acima de 14 dias (Lei 4.090/1962).\n\nFérias vencidas e proporcionais, sempre com o terço constitucional (CF, art. 7º, XVII; CLT, arts. 129 e 146). Férias vencidas não gozadas no prazo saem em dobro (CLT, art. 137).\n\nFGTS: 8% sobre a remuneração de cada mês (Lei 8.036/1990, art. 15). Na demissão sem justa causa, mais a multa de 40% sobre todo o saldo depositado (art. 18, §1º).",
      },
      {
        title: "Como o cálculo é feito",
        content:
          "Cada verba é calculada sobre a base correta — não sobre o salário nominal e pronto. Adicionais habituais (hora extra, noturno, insalubridade, periculosidade) integram a remuneração e refletem em 13º, férias e FGTS. É o que as Súmulas 45, 63, 151 e 264 do TST determinam.\n\nDepois vem a correção monetária e os juros. Desde a decisão do STF na ADC 58 (2020), aplica-se o IPCA-E mais juros da TR na fase anterior ao ajuizamento, e a taxa SELIC a partir da citação. Antes disso valia a TRD. Esta calculadora aplica o índice de cada período, mês a mês.",
      },
      {
        title: "O que muda conforme o motivo da saída",
        content:
          "Demitido sem justa causa: recebe tudo, incluindo aviso prévio, multa de 40% do FGTS e liberação do saque e do seguro-desemprego.\n\nPediu demissão: perde a multa de 40%, o aviso prévio indenizado e o seguro-desemprego. Mantém saldo de salário, 13º proporcional e férias.\n\nJusta causa: fica só com saldo de salário e férias vencidas, se houver.\n\nRescisão indireta (CLT, art. 483): a chamada justa causa do empregador. Se reconhecida, você recebe exatamente como na demissão sem justa causa — mas o ônus da prova é seu.",
      },
      {
        title: "O que costuma dar errado",
        content:
          "Verba paga por fora não aparece no contracheque, mas integra o salário — e leva reflexo em tudo. Provar isso depende de testemunha ou extrato bancário.\n\nO empregador tem 10 dias para pagar as verbas rescisórias (CLT, art. 477, §6º). Passou disso, deve multa de um salário (§8º).\n\nA prescrição alcança os últimos cinco anos, contados para trás da data em que a ação é ajuizada, e o direito de ajuizar morre dois anos depois da saída (CF, art. 7º, XXIX). Quem espera perde.",
      },
    ],
    faq: [
      {
        question: "A calculadora serve como prova em processo?",
        answer:
          "Não. Ela é uma estimativa feita com os dados que você informou, sem conferência de documento nenhum. O que ela entrega é a memória de cálculo: quais verbas você tem, sobre que base, com qual fundamento legal.\n\nEm um processo, o cálculo é refeito com os documentos reais — contracheques, cartões de ponto, extrato do FGTS — e homologado pelo juízo.",
      },
      {
        question: "Por que o resultado é uma faixa e não um valor?",
        answer:
          "Porque parte das verbas depende de prova. Saldo de salário e 13º saem do contracheque: se você trabalhou, você recebe. Já hora extra habitual, adicional de insalubridade e verba paga por fora só entram no cálculo final se houver prova nos autos.\n\nO valor mais baixo da faixa é o que se sustenta em documento. O mais alto inclui tudo. A diferença entre os dois é, na prática, o tamanho da discussão.",
      },
      {
        question: "Preciso de advogado para receber?",
        answer:
          "Para receber o que a empresa reconhece, não: a rescisão é paga direto. Para discutir o que ela não reconhece — hora extra não paga, adicional devido, verba por fora, rescisão indireta — sim.\n\nNa Justiça do Trabalho, causas acima de 40 salários mínimos exigem advogado. Abaixo disso o jus postulandi existe, mas quem litiga sozinho contra o departamento jurídico de uma empresa costuma perder por falta de técnica processual, não por falta de direito.",
      },
      {
        question: "Quanto tempo tenho para reclamar o que não recebi?",
        answer:
          "Dois anos a partir do fim do contrato para ajuizar a ação. Dentro dela, só se discutem os últimos cinco anos de contrato (CF, art. 7º, XXIX).\n\nQuem sai em 2026 e ajuíza em 2027 alcança as verbas de 2022 em diante. Quem espera até 2029 não alcança nada — a ação nem é conhecida.",
      },
    ],
  },
  {
    slug: "demissao-sem-justa-causa",
    presetTermination: "sem_justa_causa",
    title: "Fui demitido sem justa causa: quanto tenho a receber?",
    metaTitle: "Demissão sem justa causa: calcule quanto receber",
    metaDescription:
      "Aviso prévio, multa de 40% do FGTS, 13º, férias e a multa do art. 477. Calcule sua rescisão em 2 minutos, grátis e sem cadastro.",
    intro:
      "Demissão sem justa causa é a saída que mais gera verbas: a empresa dispensou você, então ela paga tudo — aviso prévio, 13º e férias proporcionais, e a multa de 40% sobre o FGTS depositado ao longo de todo o contrato.\n\nResponda sete perguntas e veja a conta aberta, verba por verba, com o artigo de lei de cada uma.",
    sections: [
      {
        title: "Aviso prévio proporcional",
        content:
          "São 30 dias de base, mais 3 dias por ano completo de trabalho, limitados a 90 dias no total (Lei 12.506/2011). Quem tem 10 anos de casa tem direito a 60 dias.\n\nSe a empresa dispensou você de trabalhar durante o aviso, ele é indenizado. E aviso indenizado projeta o contrato: o tempo dele conta para 13º, férias e FGTS, como se você tivesse trabalhado (Súmula 371 do TST).",
      },
      {
        title: "Multa de 40% do FGTS",
        content:
          "Incide sobre a soma de todos os depósitos feitos durante o contrato, corrigida — não sobre o saldo que está na conta hoje (Lei 8.036/1990, art. 18, §1º). Se você sacou o FGTS no meio do contrato, por compra de imóvel por exemplo, a base da multa continua sendo o total depositado.\n\nÉ o item mais frequentemente pago a menor, justamente porque a empresa calcula sobre o saldo em vez do total depositado.",
      },
      {
        title: "Prazo de pagamento e a multa do art. 477",
        content:
          "A empresa tem 10 dias corridos, contados do fim do contrato, para pagar as verbas rescisórias e entregar as guias (CLT, art. 477, §6º). Não importa se o aviso foi trabalhado ou indenizado.\n\nAtrasou, deve ao empregado uma multa equivalente a um salário dele (§8º), salvo se o atraso for culpa comprovada do próprio trabalhador. É devida ainda que o pagamento venha só um dia depois.",
      },
      {
        title: "Seguro-desemprego e saque do FGTS",
        content:
          "A dispensa sem justa causa libera o saque integral do FGTS e dá direito ao seguro-desemprego, entre 3 e 5 parcelas conforme o tempo trabalhado nos últimos 36 meses.\n\nA empresa é obrigada a entregar as guias. Se ela não entrega, o trabalhador pode pedir na Justiça — e a indenização substitutiva corresponde ao valor do benefício que ele deixou de receber (Súmula 389 do TST).",
      },
    ],
    faq: [
      {
        question: "A empresa pode me demitir sem motivo?",
        answer:
          "Pode. No Brasil, salvo estabilidade (gestante, cipeiro, acidentado, dirigente sindical), a dispensa não precisa de motivação — precisa é ser paga.\n\nO que a lei faz é encarecer a dispensa: aviso prévio, multa de 40%, seguro-desemprego. Esse é o custo de dispensar sem justa causa.",
      },
      {
        question: "Fui demitido durante o aviso prévio de férias. E agora?",
        answer:
          "Férias e aviso prévio não correm juntos. Se a empresa concede o aviso durante as férias, o aviso não conta — ele começa depois que as férias terminam.\n\nO mesmo vale para o período de afastamento por doença: o contrato fica suspenso e o aviso não flui.",
      },
      {
        question: "Assinei a rescisão. Ainda posso reclamar?",
        answer:
          "Sim. A quitação vale pelos valores efetivamente pagos e discriminados no termo, não pelo contrato inteiro (Súmula 330 do TST).\n\nSe faltou hora extra, adicional, verba por fora ou a multa de 40% saiu a menor, isso continua devido — e pode ser cobrado dentro do prazo de dois anos.",
      },
    ],
  },
  {
    slug: "horas-extras",
    calculator: "horas-extras",
    title: "Calculadora de horas extras",
    metaTitle: "Calculadora de horas extras com reflexos",
    metaDescription:
      "Calcule horas extras com adicional de 50%, DSR e reflexos em 13º, férias e FGTS. Grátis, com o fundamento legal de cada item.",
    intro:
      "Hora extra não é só a hora a mais: é a hora a mais com adicional, mais o descanso semanal remunerado que ela gera, mais o reflexo disso tudo em 13º, férias e FGTS. É por isso que o valor final costuma surpreender.\n\nInforme sua jornada e veja a conta aberta, com a base de cálculo de cada item.",
    sections: [
      {
        title: "Adicional mínimo de 50%",
        content:
          "A hora extra vale, no mínimo, a hora normal acrescida de 50% (CF, art. 7º, XVI; CLT, art. 59). Convenção coletiva pode elevar o percentual — 60%, 70% e 100% aparecem com frequência —, e o que a norma coletiva prevê prevalece.\n\nO trabalho em domingo e feriado sem folga compensatória é pago em dobro (Lei 605/1949, art. 9º; Súmula 146 do TST).",
      },
      {
        title: "O divisor e a base de cálculo",
        content:
          "Para jornada de 44 horas semanais, o divisor é 220. O valor da hora normal é o salário dividido por 220; a hora extra é esse valor multiplicado por 1,5.\n\nA base não é só o salário-base: adicionais habituais como periculosidade e insalubridade integram a base de cálculo da hora extra (Súmula 264 do TST). Isso muda o resultado significativamente em quem recebe periculosidade de 30%.",
      },
      {
        title: "DSR sobre horas extras",
        content:
          "Hora extra habitual repercute no descanso semanal remunerado (Súmula 172 do TST). O cálculo divide o total de horas extras do mês pelos dias úteis e multiplica pelos dias de repouso.\n\nDesde a reforma de 2017 há discussão sobre a repercussão do DSR majorado em outras verbas; a orientação atual do TST (OJ 394 revisada em 2023) admite o efeito para fatos posteriores a março de 2023.",
      },
      {
        title: "Quem tem que provar",
        content:
          "A empresa com mais de 20 empregados é obrigada a manter registro de ponto (CLT, art. 74, §2º). Se ela não apresenta os cartões em juízo, presume-se verdadeira a jornada alegada na inicial (Súmula 338, I, do TST).\n\nPonto britânico — com horários idênticos todo dia — é considerado inválido como prova e inverte o ônus contra a empresa (Súmula 338, III). Na falta de registro, a prova é testemunhal.",
      },
    ],
    faq: [
      {
        question: "Faço banco de horas. Ainda tenho direito a hora extra?",
        answer:
          "Se o banco de horas é válido e as horas foram efetivamente compensadas dentro do prazo, não há hora extra a pagar — há folga a usufruir.\n\nBanco de horas exige acordo, e o prazo de compensação é de 6 meses no acordo individual escrito e de 1 ano no acordo coletivo (CLT, art. 59, §§5º e 2º). Estourado o prazo, ou descumprido o acordo, as horas viram extras com adicional.",
      },
      {
        question: "Sou registrado como gerente. Tenho hora extra?",
        answer:
          "Depende do cargo real, não do nome no crachá. O art. 62, II, da CLT exclui do controle de jornada quem exerce cargo de gestão com poderes de mando e gratificação de pelo menos 40% sobre o salário do cargo efetivo.\n\nSem esses dois requisitos — poder real de decisão e a gratificação —, o enquadramento cai e as horas extras são devidas normalmente.",
      },
      {
        question: "Trabalho em home office. Conta hora extra?",
        answer:
          "Desde a Lei 14.442/2022, o teletrabalho por jornada está sujeito a controle e gera hora extra. Só o teletrabalho por produção ou tarefa é que fica fora do controle de jornada.\n\nMensagens fora do horário, reuniões noturnas e cobrança de resposta imediata são indícios de jornada controlada — e costumam ser o que decide o caso.",
      },
    ],
  },
  {
    slug: "rescisao-indireta",
    presetTermination: "rescisao_indireta",
    title: "Rescisão indireta: a justa causa do empregador",
    metaTitle: "Rescisão indireta: quando cabe e quanto vale",
    metaDescription:
      "Salário atrasado, assédio, desvio de função: quando cabe rescisão indireta e quanto ela vale. Calcule grátis, com fundamento legal.",
    intro:
      "Rescisão indireta é a saída em que o empregado rompe o contrato por culpa do empregador. Reconhecida, ela paga exatamente como a demissão sem justa causa: aviso prévio, multa de 40% do FGTS, seguro-desemprego, tudo.\n\nO problema não é o valor, é o risco. Quem pede rescisão indireta e perde sai com o mesmo que teria pedindo demissão. Calcule o que está em jogo antes de decidir.",
    sections: [
      {
        title: "As hipóteses do art. 483 da CLT",
        content:
          "A lei lista as situações que autorizam o rompimento por culpa do empregador: exigir serviço superior às forças ou alheio ao contrato; tratar o empregado com rigor excessivo; expor a perigo manifesto; descumprir as obrigações do contrato; praticar ato lesivo à honra; agredir fisicamente; reduzir o trabalho por peça de modo a afetar sensivelmente o salário.\n\nNa prática, o que mais aparece em juízo é a alínea 'd' — descumprimento de obrigação contratual: salário atrasado, FGTS não depositado, hora extra sistematicamente não paga.",
      },
      {
        title: "Salário atrasado e FGTS não depositado",
        content:
          "Atraso reiterado de salário é a hipótese mais aceita. Atraso isolado, não: a jurisprudência exige habitualidade ou gravidade.\n\nA falta de depósito do FGTS também autoriza a rescisão indireta, e o TST a reconhece mesmo quando o empregado permaneceu trabalhando (a chamada ausência de imediatidade não afasta o direito, porque o empregado depende do salário para viver).",
      },
      {
        title: "O ônus da prova é de quem alega",
        content:
          "Diferente da justa causa do empregado, aqui é o trabalhador que precisa provar a falta grave do empregador. Contracheque, extrato do FGTS, e-mail, mensagem, testemunha — o que estiver disponível.\n\nExtrato do FGTS e contracheque com data de pagamento são prova documental forte. Assédio moral, por depender de prova testemunhal, é o pedido com maior taxa de improcedência.",
      },
      {
        title: "Continuar trabalhando ou sair antes",
        content:
          "É possível ajuizar a ação e continuar trabalhando (CLT, art. 483, §3º, para as hipóteses 'd' e 'g'). É a via mais segura: se o pedido for julgado improcedente, o contrato segue.\n\nQuem para de trabalhar e o pedido é negado tem o abandono caracterizado — e sai como se tivesse pedido demissão, sem multa de 40% e sem seguro-desemprego.",
      },
    ],
    faq: [
      {
        question: "Se eu perder, o que acontece?",
        answer:
          "O juiz converte a saída em pedido de demissão. Você fica com saldo de salário, 13º e férias proporcionais, e perde aviso prévio, multa de 40% e seguro-desemprego.\n\nEm alguns casos o juízo reconhece a chamada culpa recíproca, e aí as verbas rescisórias saem pela metade (CLT, art. 484).",
      },
      {
        question: "Quanto tempo posso esperar antes de entrar com a ação?",
        answer:
          "Não há prazo fixo, mas demora demais enfraquece o argumento de falta grave: se a situação era insuportável, por que ficou dois anos?\n\nA exceção consolidada é o atraso de salário e a falta de FGTS, em que o TST entende que a permanência não significa perdão, porque o trabalhador depende daquela renda.",
      },
      {
        question: "Preciso avisar a empresa antes?",
        answer:
          "Não existe exigência legal de notificação prévia. Na prática, uma notificação extrajudicial documentando a falta ajuda: ela prova que a empresa foi cientificada e não corrigiu.\n\nEla também costuma resolver o caso sem processo — não são raras as empresas que preferem converter a saída em demissão sem justa causa quando recebem a notificação.",
      },
    ],
  },
  {
    slug: "ferias-e-13o",
    calculator: "ferias-13",
    title: "Calculadora de férias e 13º salário",
    metaTitle: "Calculadora de férias, terço e 13º proporcional",
    metaDescription:
      "Férias vencidas, proporcionais, terço constitucional e 13º: calcule o que ficou pendente, com o fundamento legal de cada verba.",
    intro:
      "Férias e 13º são as verbas que mais ficam pendentes — e as mais fáceis de conferir, porque saem de contracheque e da carteira de trabalho.\n\nInforme quantos períodos ficaram para trás e veja o cálculo, incluindo o terço constitucional e a dobra do art. 137 quando ela cabe.",
    sections: [
      {
        title: "Férias vencidas, proporcionais e o terço",
        content:
          "A cada 12 meses de trabalho nasce o direito a 30 dias de férias (CLT, art. 129), que devem ser concedidas nos 12 meses seguintes — o chamado período concessivo (art. 134).\n\nSobre o valor das férias incide sempre o terço constitucional (CF, art. 7º, XVII). Na saída, as férias proporcionais são devidas na razão de 1/12 por mês trabalhado, contando mês inteiro a fração superior a 14 dias — inclusive para quem pede demissão (Súmula 261 do TST).",
      },
      {
        title: "Férias em dobro",
        content:
          "Passado o período concessivo sem que as férias fossem concedidas, elas são pagas em dobro (CLT, art. 137). A dobra alcança também o terço constitucional.\n\nÉ o item mais esquecido em rescisões de contratos longos: quem ficou anos sem tirar férias tem, em geral, mais de um período em dobro a receber.",
      },
      {
        title: "13º salário proporcional",
        content:
          "1/12 do salário por mês trabalhado no ano, com a fração acima de 14 dias contando como mês inteiro (Lei 4.090/1962). O aviso prévio indenizado projeta o contrato e pode acrescentar mais um avo.\n\nO 13º integra a base do FGTS, e o adicional habitual (hora extra, noturno, insalubridade) integra a base do 13º — é o reflexo das Súmulas 45 e 264 do TST.",
      },
      {
        title: "O que costuma dar errado",
        content:
          "Férias pagas fora do prazo — a lei exige pagamento até 2 dias antes do início (CLT, art. 145) — geram o pagamento em dobro segundo a Súmula 450 do TST.\n\nO abono pecuniário, a venda de 1/3 das férias, é direito do empregado (art. 143) e não pode ser imposto pela empresa. Férias coletivas descontadas de quem não tinha período aquisitivo completo também rendem discussão.",
      },
    ],
    faq: [
      {
        question: "Pedi demissão. Perco as férias proporcionais?",
        answer:
          "Não. A Súmula 261 do TST garante férias proporcionais com o terço a quem pede demissão, independentemente do tempo de casa.\n\nO que se perde ao pedir demissão é o aviso prévio indenizado, a multa de 40% do FGTS e o seguro-desemprego — não as férias.",
      },
      {
        question: "Fui demitido por justa causa. E as férias?",
        answer:
          "As férias vencidas — aquelas cujo período aquisitivo já se completou — são devidas mesmo na justa causa, com o terço.\n\nAs proporcionais, não: a Súmula 171 do TST as exclui na dispensa por justa causa.",
      },
      {
        question: "A empresa pode parcelar minhas férias?",
        answer:
          "Pode, desde a reforma de 2017, em até três períodos, com a concordância do empregado. Um deles precisa ter no mínimo 14 dias corridos, e os outros dois não podem ser menores que 5 dias cada (CLT, art. 134, §1º).\n\nO início das férias não pode cair em feriado, sábado ou domingo, nem nos dois dias que antecedem esses dias (§3º).",
      },
    ],
  },
];
