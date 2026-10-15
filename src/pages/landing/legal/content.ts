export interface LegalSection {
  title: string;
  content: string;
}

export interface LegalDoc {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const privacyDoc: LegalDoc = {
  title: "Política de Privacidade",
  lastUpdated: "11 de maio de 2026",
  sections: [
    {
      title: "Informações que coletamos",
      content:
        "Coletamos informações que você nos fornece diretamente ao utilizar a plataforma LexLaboral, incluindo:\n\n• Dados de cadastro: nome, e-mail, OAB e telefone.\n• Dados de uso: cálculos realizados, documentos gerados e preferências de configuração.\n• Dados técnicos: endereço IP, tipo de navegador, sistema operacional e dados de acesso.\n\nNão coletamos informações de forma oculta ou por meios não autorizados.",
    },
    {
      title: "Como utilizamos suas informações",
      content:
        "Utilizamos suas informações para:\n\n• Prestar e melhorar os serviços da plataforma.\n• Gerar cálculos trabalhistas e documentos conforme solicitado.\n• Enviar notificações relevantes sobre sua conta e atualizações do serviço.\n• Garantir a segurança e integridade da plataforma.\n• Cumprir obrigações legais e regulatórias.\n\nNão compartilhamos seus dados com terceiros para fins de marketing.",
    },
    {
      title: "Compartilhamento de dados",
      content:
        "Seus dados podem ser compartilhados apenas nas seguintes situações:\n\n• Com prestadores de serviços que atuam em nosso nome (hospedagem, processamento de pagamentos), sob obrigação de confidencialidade.\n• Quando exigido por lei, ordem judicial ou determinação de autoridade competente.\n• Para proteger os direitos, a segurança ou a propriedade da LexLaboral ou de terceiros.\n\nOs cálculos e documentos que você gera são de sua exclusiva responsabilidade e não são compartilhados com terceiros.",
    },
    {
      title: "Armazenamento e segurança",
      content:
        "Armazenamos seus dados em servidores seguros com criptografia em trânsito (TLS) e em repouso. Implementamos medidas técnicas e organizacionais adequadas para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.\n\nRetemos seus dados pelo tempo necessário para prestar os serviços e cumprir obrigações legais. Após a exclusão da conta, os dados são removidos dentro de 30 dias, salvo exigência legal de retenção.",
    },
    {
      title: "Integração com o Google (Google Calendar)",
      content:
        "A conexão com sua conta Google é opcional e só ocorre quando você a autoriza expressamente na plataforma.\n\n• Escopos solicitados: acesso ao seu Google Calendar para criar, ler e atualizar eventos de audiências e prazos dos seus processos.\n• Como usamos: sincronizamos audiências e prazos cadastrados no LexLaboral com o seu Google Agenda, nos dois sentidos.\n• Armazenamento: guardamos apenas os tokens de acesso necessários para a sincronização e os identificadores dos eventos que criamos. Você pode revogar o acesso a qualquer momento nas Configurações da plataforma ou em https://myaccount.google.com/permissions.\n\nUso limitado: o uso e a transferência de informações recebidas das APIs do Google pelo LexLaboral obedecem à Política de Dados de Usuário dos Serviços de API do Google (Google API Services User Data Policy), incluindo os requisitos de Uso Limitado (Limited Use). Não usamos os dados do Google para publicidade, não os vendemos e não os compartilhamos com terceiros, exceto para prestar a funcionalidade de sincronização solicitada por você.",
    },
    {
      title: "Cookies e tecnologias similares",
      content:
        "Utilizamos cookies e tecnologias similares para:\n\n• Manter sua sessão autenticada.\n• Lembrar suas preferências de tema e configuração.\n• Analisar o uso da plataforma para melhorias.\n\nVocê pode gerenciar ou desabilitar cookies nas configurações do navegador, mas isso pode afetar a funcionalidade da plataforma.",
    },
    {
      title: "Seus direitos",
      content:
        "De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:\n\n• Confirmar a existência de tratamento de dados.\n• Acessar seus dados pessoais.\n• Corrigir dados incompletos, inexatos ou desatualizados.\n• Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.\n• Revogar o consentimento a qualquer momento.\n• Solicitar a portabilidade dos dados.\n\nPara exercer seus direitos, entre em contato pelo e-mail contato@lexlaboral.com.br.",
    },
    {
      title: "Alterações nesta política",
      content:
        "Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre alterações significativas por e-mail ou por aviso na plataforma. A data da última atualização é indicada no topo desta página.",
    },
  ],
};

export const termsDoc: LegalDoc = {
  title: "Termos de Uso",
  lastUpdated: "11 de maio de 2026",
  sections: [
    {
      title: "Aceitação dos termos",
      content:
        "Ao acessar e utilizar a plataforma LexLaboral, você concorda com estes Termos de Uso. Caso não concorde com qualquer disposição, não utilize a plataforma.\n\nO uso continuado após alterações constitui aceitação dos novos termos.",
    },
    {
      title: "Descrição do serviço",
      content:
        'A LexLaboral é uma plataforma SaaS destinada a advogados trabalhistas, que oferece:\n\n• Cálculos automatizados de verbas trabalhistas (rescisão, FGTS, férias, 13º, horas extras, adicional noturno, etc.).\n• Geração de documentos personalizáveis a partir de modelos (DOCX/PDF).\n• Gestão de clientes e casos.\n• Compartilhamento de cálculos via portal do cliente.\n\nO serviço é fornecido "como está" e pode ser modificado, suspenso ou descontinuado a qualquer momento, com aviso prévio quando possível.',
    },
    {
      title: "Cadastro e conta",
      content:
        "Para utilizar a plataforma, é necessário criar uma conta fornecendo informações verdadeiras e completas.\n\nVocê é responsável por:\n\n• Manter a confidencialidade de suas credenciais de acesso.\n• Todas as atividades realizadas em sua conta.\n• Notificar imediatamente qualquer uso não autorizado.\n\nReservamo-nos o direito de suspender ou encerrar contas que violem estes termos.",
    },
    {
      title: "Uso aceitável",
      content:
        "Você se compromete a não:\n\n• Utilizar a plataforma para fins ilícitos ou contrários à ética profissional.\n• Reproduzir, distribuir ou modificar o serviço sem autorização.\n• Tentar acessar áreas restritas ou sistemas não autorizados.\n• Utilizar robôs, scrapers ou mecanismos automatizados sem consentimento.\n• Compartilhar suas credenciais com terceiros.\n\nViolações podem resultar em suspensão ou encerramento da conta, sem reembolso.",
    },
    {
      title: "Propriedade intelectual",
      content:
        "Todo o conteúdo da plataforma — incluindo design, código, textos, logos, marcas e modelos de documentos — é propriedade da LexLaboral ou licenciado a ela.\n\nOs cálculos e documentos gerados por você são de sua autoria e responsabilidade. Os modelos de documentos fornecidos pela plataforma são licenciados para uso dentro do serviço, não podendo ser revendidos ou redistribuídos como produto independente.",
    },
    {
      title: "Planos e pagamento",
      content:
        "A LexLaboral oferece planos gratuitos e pagos. Ao assinar um plano pago:\n\n• O pagamento é processado mensal ou anualmente, conforme o plano escolhido.\n• Planos anuais não são reembolsáveis proporcionalmente após o período de garantia de 7 dias.\n• Planos mensais podem ser cancelados a qualquer tempo, com acesso até o final do período já pago.\n• Falhas de pagamento podem resultar na suspensão do acesso às funcionalidades pagas.\n\nOferecemos 7 dias grátis para novos usuários experimentarem a plataforma.",
    },
    {
      title: "Limitação de responsabilidade",
      content:
        "A LexLaboral não se responsabiliza por:\n\n• Decisões judiciais baseadas exclusivamente nos cálculos da plataforma.\n• Danos indiretos, incidentais ou consequenciais decorrentes do uso do serviço.\n• Interrupções temporárias do serviço por manutenção ou falhas técnicas.\n• Precisão dos dados inseridos pelo usuário para geração de cálculos.\n\nA plataforma é uma ferramenta auxiliar e não substitui o julgamento profissional do advogado.",
    },
    {
      title: "Rescisão",
      content:
        "Você pode cancelar sua conta a qualquer momento através das configurações da plataforma ou por e-mail.\n\nPodemos encerrar ou suspender sua conta em caso de violação destes termos, com aviso prévio quando aplicável.\n\nApós o encerramento, seus dados serão retidos pelo período legal exigido e depois eliminados conforme nossa Política de Privacidade.",
    },
    {
      title: "Disposições gerais",
      content:
        "• Estes termos são regidos pelas leis da República Federativa do Brasil.\n• Qualquer disputa será submetida ao foro da comarca do domicílio do usuário, quando favorecido pela legislação consumerista.\n• Se qualquer disposição for considerada inválida, as demais permanecerão em vigor.\n• A falha em exercer um direito não constitui renúncia.\n• Estes termos constituem o acordo integral entre você e a LexLaboral quanto ao uso da plataforma.",
    },
  ],
};

export const lgpdDoc: LegalDoc = {
  title: "Política de Proteção de Dados (LGPD)",
  lastUpdated: "11 de maio de 2026",
  sections: [
    {
      title: "Controlador dos dados",
      content:
        "A LexLaboral, inscrita no CNPJ sob o nº a ser divulgado, com sede a ser confirmada, é a controladora dos dados pessoais tratados na plataforma, conforme definido pela Lei nº 13.709/2018 (LGPD).\n\nPara exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados, entre em contato pelo e-mail contato@lexlaboral.com.br.",
    },
    {
      title: "Dados pessoais tratados",
      content:
        "Tratamos as seguintes categorias de dados pessoais:\n\n• Dados de identificação: nome completo, e-mail, número da OAB e telefone.\n• Dados profissionais: informações sobre clientes e casos jurídicos inseridos pelo usuário.\n• Dados de pagamento: processados por provedores certificados (não armazenados diretamente pela LexLaboral).\n• Dados técnicos: endereço IP, logs de acesso, tipo de navegador e dispositivo.\n• Dados de uso: cálculos gerados, documentos produzidos e histórico de ações na plataforma.",
    },
    {
      title: "Bases legais para o tratamento",
      content:
        "O tratamento de dados pessoais na LexLaboral se fundamenta em:\n\n• Execução de contrato (Art. 7º, V): prestação dos serviços contratados pelo usuário.\n• Consentimento (Art. 7º, I): envio de comunicações de marketing, quando autorizado.\n• Legítimo interesse (Art. 7º, IX): melhoria da plataforma, prevenção de fraudes e segurança.\n• Cumprimento de obrigação legal (Art. 7º, II): atendimento a requisições legais e regulatórias.\n\nO consentimento pode ser revogado a qualquer momento, sem comprometer a licitude do tratamento anterior.",
    },
    {
      title: "Compartilhamento de dados",
      content:
        "Compartilhamos dados pessoais apenas com:\n\n• Provedores de infraestrutura e hospedagem (com proteção adequada dos dados).\n• Processadores de pagamento certificados (dados estritamente necessários).\n• Autoridades públicas, quando exigido por lei ou ordem judicial.\n\nNão vendemos, alugamos ou compartilhamos seus dados com terceiros para fins comerciais.",
    },
    {
      title: "Transferência internacional de dados",
      content:
        "Os dados podem ser processados em servidores localizados fora do Brasil, sempre com garantias adequadas de proteção conforme o Art. 33 da LGPD.\n\nUtilizamos provedores que cumprem padrões internacionais de segurança e privacidade, incluindo contratos com cláusulas de proteção de dados.",
    },
    {
      title: "Direitos do titular",
      content:
        "Conforme a LGPD, você tem os seguintes direitos:\n\n• Confirmação e acesso: verificar a existência e acessar seus dados.\n• Correção: corrigir dados incompletos, inexatos ou desatualizados.\n• Anonimização, bloqueio ou eliminação: solicitar tratamento de dados desnecessários ou excessivos.\n• Portabilidade: solicitar a transferência dos dados a outro fornecedor.\n• Eliminação: pedir a exclusão dos dados tratados com base no consentimento.\n• Informação sobre compartilhamento: saber com quais entidades os dados foram compartilhados.\n• Revogação do consentimento: retirar o consentimento a qualquer momento.\n\nSolicitações serão atendidas no prazo de até 15 dias úteis, conforme Art. 18, §5º da LGPD.",
    },
    {
      title: "Medidas de segurança",
      content:
        "Adotamos as seguintes medidas técnicas e administrativas:\n\n• Criptografia de dados em trânsito (TLS 1.2+) e em repouso.\n• Controle de acesso baseado em funções (RBAC).\n• Monitoramento contínuo de acessos e atividades suspeitas.\n• Backups criptografados e plano de recuperação de desastres.\n• Revisão periódica de políticas de segurança.\n\nEm caso de incidente de segurança que possa acarretar risco aos titulares, comunicaremos a ANPD e os titulares afetados conforme Art. 48 da LGPD.",
    },
    {
      title: "Dados de menores de idade",
      content:
        "A plataforma LexLaboral é destinada a profissionais advogados e não é direcionada a menores de 18 anos. Não coletamos intencionalmente dados de menores.\n\nCaso tome conhecimento de que um menor forneu dados pessoais sem autorização, entre em contato para que possamos tomar as providências necessárias.",
    },
    {
      title: "Alterações nesta política",
      content:
        "Esta política pode ser atualizada periodicamente para refletir mudanças em nossas práticas ou na legislação.\n\nAlterações significativas serão comunicadas por e-mail ou aviso na plataforma. A data de atualização é indicada no topo desta página.",
    },
    {
      title: "Autoridade de proteção de dados",
      content:
        "Caso entenda que o tratamento dos seus dados viola a LGPD, você pode apresentar reclamação perante a Autoridade Nacional de Proteção de Dados (ANPD).\n\nMais informações em gov.br/anpd.",
    },
  ],
};
