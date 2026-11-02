// ====================================================
// TIPOS E DADOS PADRÃO DO CMS (ICTHUS / GLESSIOS)
// ====================================================

export interface CMSHeroMetric {
  id: string;
  number: number;
  prefix: string;
  suffix: string;
  title: string;
  subtitle: string;
  duration: number;
}

export interface CMSHeroContent {
  badgeText: string;
  titleLine1: string;
  titleLine2Prefix: string;
  rotatingWords: string[];
  subtitle: string;
  primaryButton: {
    label: string;
    url: string;
  };
  secondaryButton: {
    label: string;
    url: string;
  };
  metrics: CMSHeroMetric[];
  background: {
    type: "video" | "image" | "url";
    url: string;
    poster?: string;
  };
}

export interface CMSSolutionsCard {
  id: string;
  title: string;
  icon: string;
  description: string;
  targetHash: string;
}

export interface CMSSolutionsContent {
  badgeText: string;
  title: string;
  paragraphs: string[];
  closingHighlight: string;
  cards: CMSSolutionsCard[];
}

export interface CMSAboutPillar {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export interface CMSAboutMissionCard {
  id: string;
  badge: string;
  title: string;
  icon: string;
  description: string;
}

export interface CMSAboutDifferential {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export interface CMSAboutContent {
  badgeText: string;
  title: string;
  subtitle: string;
  pillars: CMSAboutPillar[];
  video: {
    badge: string;
    title: string;
    subtitle: string;
    videoUrl: string;
    posterUrl: string;
  };
  missionCards: CMSAboutMissionCard[];
  differentialsBadge: string;
  differentialsTitle: string;
  differentials: CMSAboutDifferential[];
}

export interface CMSActionAreaCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  tag: string;
}

export interface CMSActionAreasContent {
  badgeText: string;
  title: string;
  subtitle: string;
  cards: CMSActionAreaCard[];
}

export interface CMSServiceCard {
  id: string;
  category: string;
  icon: string;
  badgeText: string;
  title: string;
  highlight: string;
  paragraphs: string[];
  features: string[];
  buttonText: string;
  buttonLink: string;
}

export interface CMSServicesContent {
  badgeText: string;
  title: string;
  subtitle: string;
  cards: CMSServiceCard[];
}

export interface CMSTeamContent {
  badgeText: string;
  title: string;
  subtitle: string;
  leader: {
    name: string;
    role: string;
    badge: string;
    bio: string;
    initials: string;
    highlights: Array<{
      id: string;
      icon: string;
      text: string;
    }>;
  };
}

export interface CMSTestimonialCard {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  tag: string;
}

export interface CMSTestimonialsContent {
  badgeText: string;
  title: string;
  subtitle: string;
  cards: CMSTestimonialCard[];
}

export interface CMSContactPhone {
  id: string;
  number: string;
  formatted: string;
  label: string;
  isWhatsapp?: boolean;
}

export interface CMSContactEmail {
  id: string;
  email: string;
  label: string;
}

export interface CMSGlobalContactContent {
  whatsapp: {
    number: string;
    formatted: string;
    defaultMessage: string;
  };
  phones: CMSContactPhone[];
  emails: CMSContactEmail[];
  address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  socialLinks: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  footerNotice: string;
}

export interface CMSPortfolioSectionContent {
  badgeText: string;
  title: string;
  subtitle: string;
  categories: string[];
}

export interface CMSCompleteSiteData {
  hero: CMSHeroContent;
  solutions: CMSSolutionsContent;
  about: CMSAboutContent;
  action_areas: CMSActionAreasContent;
  services: CMSServicesContent;
  team: CMSTeamContent;
  testimonials: CMSTestimonialsContent;
  contact_info: CMSGlobalContactContent;
  portfolio: CMSPortfolioSectionContent;
}

// ====================================================
// VALORES PADRÃO (FALLBACK ROBUSTO)
// ====================================================

export const DEFAULT_HERO_CONTENT: CMSHeroContent = {
  badgeText: "Você veio ao lugar certo!",
  titleLine1: "Soluções criativas",
  titleLine2Prefix: "para",
  rotatingWords: ["o seu negócio", "sua empresa", "sua fachada", "sua marca", "seu projeto"],
  subtitle: "Nosso trabalho é pensar em soluções, deixe-nos te ajudar!",
  primaryButton: {
    label: "Solicitar Orçamento Exclusivo",
    url: "/#contato",
  },
  secondaryButton: {
    label: "Explorar Portfólio",
    url: "/#portfolio",
  },
  metrics: [
    {
      id: "met-1",
      number: 12,
      prefix: "+",
      suffix: " Anos",
      title: "+12 Anos",
      subtitle: "Expertise fabril",
      duration: 1600,
    },
    {
      id: "met-2",
      number: 1800,
      prefix: "+",
      suffix: "",
      title: "+1800",
      subtitle: "Obras entregues",
      duration: 2000,
    },
    {
      id: "met-3",
      number: 100,
      prefix: "",
      suffix: "% ART",
      title: "100% ART",
      subtitle: "Engenharia e NR-35",
      duration: 1500,
    },
  ],
  background: {
    type: "video",
    url: "/videos/hero-background.mp4",
  },
};

export const DEFAULT_SOLUTIONS_CONTENT: CMSSolutionsContent = {
  badgeText: "NOSSO TRABALHO É PENSAR EM SOLUÇÕES, DEIXE-NOS TE AJUDAR",
  title: "NÓS TEMOS A SOLUÇÃO QUE VOCÊ PROCURA",
  paragraphs: [
    "Estamos sempre tentando manter nosso pacote de serviços atualizado, com novidades e com o que há de mais moderno em soluções, nos mantemos constantemente inspirados para atender a cada cliente com a exclusividade e atenção merecida. Cada cliente é único e não nos contentamos com soluções genéricas.",
  ],
  closingHighlight: "Venha para nosso mundo e descubra tudo o que podemos fazer por você ou por sua empresa.",
  cards: [
    {
      id: "sol-1",
      title: "Consultoria",
      icon: "Compass",
      description: "Orientação especializada para otimizar custos, tempo e a imagem do seu negócio.",
      targetHash: "#servicos",
    },
    {
      id: "sol-2",
      title: "Projetos",
      icon: "Layers",
      description: "Concepção técnica e estrutural de sinalização, fachadas e identidade corporativa.",
      targetHash: "#portfolio",
    },
    {
      id: "sol-3",
      title: "Produtos",
      icon: "Box",
      description: "Letreiros, placas, painéis, troféus e itens acabados com máxima qualidade.",
      targetHash: "#portfolio",
    },
    {
      id: "sol-4",
      title: "Gerenciamento",
      icon: "Kanban",
      description: "Acompanhamento integral do cronograma, fabricação, montagem e pós-entrega.",
      targetHash: "#atuacao",
    },
  ],
};

export const DEFAULT_ABOUT_CONTENT: CMSAboutContent = {
  badgeText: "Quem Somos",
  title: "Sobre nós",
  subtitle: "Dedicados a construir soluções visuais e projetos sob medida que elevam a presença da sua marca com exclusividade, eficiência e pontualidade.",
  pillars: [
    {
      id: "pil-1",
      title: "Superar Expectativas",
      icon: "Target",
      description: "Encontrar sempre as melhores soluções para cada cliente de forma a suprir e/ou superar suas expectativas.",
    },
    {
      id: "pil-2",
      title: "Tudo em um Só Lugar",
      icon: "Layers",
      description: "Oferecer o maior número de produtos possível para que o cliente possa encontrar tudo o que precisa em um só lugar e possa manter-se focado em suas atividades.",
    },
    {
      id: "pil-3",
      title: "Comodidade & Confiança",
      icon: "ShieldCheck",
      description: "Proporcionar a máxima comodidade, entregando os produtos solicitados prontos e instalados, garantindo tranquilidade.",
    },
  ],
  video: {
    badge: "Visão Geral",
    title: "Conheça Nossa Estrutura & Processos",
    subtitle: "Do projeto computadorizado à usinagem CNC de precisão e montagem com equipe técnica própria.",
    videoUrl: "/videos/hero-background.mp4",
    posterUrl: "/images/portfolio/fachada-acm-tech-tower-thumb.webp",
  },
  missionCards: [
    {
      id: "mis-1",
      badge: "Propósito",
      title: "Missão",
      icon: "Target",
      description: "Oferecer aos nossos clientes o que há de melhor em soluções visuais, produtos e serviços em comunicação visual, primando pela excelência no atendimento e na execução.",
    },
    {
      id: "mis-2",
      badge: "Futuro",
      title: "Visão",
      icon: "Eye",
      description: "Ser referência regional e estadual em soluções visuais criativas e projetos industriais, reconhecida pela precisão técnica, acabamento superior e pontualidade.",
    },
    {
      id: "mis-3",
      badge: "Princípios",
      title: "Valores",
      icon: "Award",
      description: "Ética, responsabilidade com os compromissos assumidos, rigor técnico na fabricação, valorização das pessoas e melhoria contínua de processos.",
    },
  ],
  differentialsBadge: "Por que nos escolher",
  differentialsTitle: "Diferenciais que Comprovam Nossa Qualidade",
  differentials: [
    {
      id: "dif-1",
      title: "Garantia Integral",
      icon: "ShieldCheck",
      description: "Garantia de 5 anos em estruturas de ACM e 3 anos em módulos de iluminação LED.",
    },
    {
      id: "dif-2",
      title: "Engenharia & ART",
      icon: "FileCheck2",
      description: "Projetos acompanhados por engenheiro civil com emissão de ART e conformidade NR-35.",
    },
    {
      id: "dif-3",
      title: "Pontualidade Rigorosa",
      icon: "Clock",
      description: "Cronogramas de fabricação monitorados em tempo real com entrega sem atrasos.",
    },
    {
      id: "dif-4",
      title: "Fabricação Própria",
      icon: "Layers",
      description: "Usinagem em Router CNC industrial própria sem intermediação ou terceirização.",
    },
  ],
};

export const DEFAULT_ACTION_AREAS_CONTENT: CMSActionAreasContent = {
  badgeText: "COMO PODEMOS TE AJUDAR ?",
  title: "ÁREAS DE ATUAÇÃO",
  subtitle: "Conheça os segmentos em que atuamos com excelência e tecnologia de ponta para transformar a presença visual do seu negócio.",
  cards: [
    {
      id: "act-1",
      icon: "Globe",
      title: "PRODUTOS WEB",
      description: "Mantenha-se visível no ambiente digital! Uma boa vitrine digital pode abrir mais portas do que você imagina. Oferecemos diversas soluções para ajudá-los a marcar presença no mundo digital.",
      tag: "Presença Digital",
    },
    {
      id: "act-2",
      icon: "Handshake",
      title: "PARCERIAS",
      description: "Não se preocupe, se precisar de algum produto ou serviço que não esteja em nosso catálogo, ficaremos felizes em indicar algum de nossos parceiros de confiança.",
      tag: "Rede Homologada",
    },
    {
      id: "act-3",
      icon: "Truck",
      title: "PRODUÇÃO E ENTREGA",
      description: "Entregamos produtos acabados e com mão de obra incluída, o máximo de comodidade para você e para sua empresa. Tudo em um só lugar, menos dor de cabeça e mais tempo para o que é necessário.",
      tag: "Chave na Mão",
    },
    {
      id: "act-4",
      icon: "Palette",
      title: "CRIAÇÃO E DESENVOLVIMENTO",
      description: "Se você vai começar um novo negócio ou está precisando modernizar sua marca, conte conosco para criar tudo... desde a nova logo, até as peças necessárias para os materiais de rotina, papelaria, sinalização etc.",
      tag: "Branding & Peças",
    },
    {
      id: "act-5",
      icon: "Compass",
      title: "CONSULTORIA",
      description: "Oferecemos consultoria em assuntos relacionados à imagem de seu negócio, comunicação visual, padronização de identidade visual, sinalização Interna e Externa. Soluções é nossa especialidade!",
      tag: "Estratégia Visual",
    },
    {
      id: "act-6",
      icon: "Kanban",
      title: "GERENCIAMENTO DE PROJETOS",
      description: "Nossa equipe pode ajudar a gerenciar seu novo projeto de comunicação visual, novas lojas, novas filiais, franquias, trabalhos que exijam cuidados com os padrões estabelecidos pela franquiadora ou pelo manual da marca.",
      tag: "Expansão & Franquias",
    },
  ],
};

export const DEFAULT_SERVICES_CONTENT: CMSServicesContent = {
  badgeText: "NOSSO CATÁLOGO",
  title: "PRINCIPAIS SERVIÇOS",
  subtitle: "Soluções integradas de comunicação visual, projetos e fabricação sob medida com acabamento premium.",
  cards: [
    {
      id: "design",
      category: "DESIGN",
      icon: "Lightbulb",
      badgeText: "Início de Negócio & Reposicionamento",
      title: "Criação de Marcas e Identidade Visual",
      highlight: "Sua marca criada com responsabilidade",
      paragraphs: [
        "Utilize este serviço se você está iniciando um novo negócio e precisa criar uma marca ou uma identidade visual que represente de forma profissional e moderna o conceito do seu negócio.",
        "Sua marca vai te acompanhar por um longo tempo e é importante que seja criada com responsabilidade.",
        "Buscar ajuda especializada desde o começo é inteligente e geralmente evita dores de cabeça no futuro.",
      ],
      features: [
        "Identidade visual completa e manual de uso",
        "Conceito alinhado com o público-alvo",
        "Arquivos prontos para digital, gráfica e sinalização",
      ],
      buttonText: "Solicitar Orçamento em Design",
      buttonLink: "/#contato",
    },
    {
      id: "producao",
      category: "PRODUÇÃO",
      icon: "Cog",
      badgeText: "Temos muito a oferecer !",
      title: "Fabricação e Instalação de Peças Físicas",
      highlight: "Temos muito a oferecer !",
      paragraphs: [
        "Utilize este serviço se você já tem sua marca criada e já tem definidas as peças de que precisa.",
        "Desde itens como a fachada externa ou placas internas até os itens de uso diário, como cartão de visita, folders envelopes, brindes, pastas etc.",
        "Parte do trabalho já foi feita, gostaríamos de ajudar criando peças de qualidade e com materiais adequados para que o padrão de seu negócio se mantenha inalterado. Podemos ajudar na produção e na instalação destas peças.",
      ],
      features: [
        "Fachadas externas e placas de sinalização interna",
        "Materiais impressos de rotina, folders e envelopes",
        "Mão de obra e instalação com acabamento fino",
      ],
      buttonText: "Solicitar Orçamento em Produção",
      buttonLink: "/#contato",
    },
    {
      id: "consultoria",
      category: "CONSULTORIA",
      icon: "UserCheck",
      badgeText: "Melhor custo benefício",
      title: "Otimização de Custos, Tempo e Execução",
      highlight: "Melhor custo benefício",
      paragraphs: [
        "Utilize este serviço se você já tem uma empresa estabelecida e precisa de orientação para otimizar custos e tempo na contratação de serviços de comunicação visual.",
        "Ajudamos a identificar gargalos, selecionar os melhores materiais e fornecedores, e garantir que seus recursos sejam aplicados com máxima eficiência.",
        "Uma consultoria independente protege seu investimento e garante conformidade com as normas técnicas vigentes.",
      ],
      features: [
        "Auditoria de projetos e materiais existentes",
        "Especificação técnica independente e sem conflito de interesse",
        "Acompanhamento de orçamentos e homologação de parceiros",
      ],
      buttonText: "Agendar Consultoria Especializada",
      buttonLink: "/#contato",
    },
    {
      id: "desenvolvimento",
      category: "DESENVOLVIMENTO",
      icon: "Wrench",
      badgeText: "Soluções personalizadas",
      title: "Projetos Especiais e Peças Sob Medida",
      highlight: "Soluções personalizadas",
      paragraphs: [
        "Utilize este serviço se você precisa de algo que não existe pronto no mercado ou que requer projeto técnico sob medida.",
        "Totens interativos, displays especiais para feiras e eventos, sinalização arquitetônica de alta complexidade ou peças com iluminação personalizada.",
        "Nossa equipe de engenharia e marcenaria/serralheria industrial transforma ideias complexas em realidade palpável e funcional.",
      ],
      features: [
        "Modelagem 3D e prototipagem prévia",
        "Cálculo estrutural e especificações elétricas",
        "Entrega chave na mão com testes operacionais completos",
      ],
      buttonText: "Desenvolver Projeto Especial",
      buttonLink: "/#contato",
    },
  ],
};

export const DEFAULT_TEAM_CONTENT: CMSTeamContent = {
  badgeText: "Liderança & Compromisso",
  title: "Nossa Equipe",
  subtitle: "Profissionais dedicados a pensar nas soluções mais inteligentes e funcionais para o seu negócio.",
  leader: {
    name: "Glessios Gusso",
    role: "Diretor Geral",
    badge: "Direção & Estratégia",
    bio: "Com mais de 12 anos de experiência na concepção e gerenciamento de soluções visuais e projetos industriais, Glessios Gusso lidera pessoalmente a garantia de que cada cliente receba atenção exclusiva e soluções sob medida.",
    initials: "GG",
    highlights: [
      {
        id: "hl-1",
        icon: "ShieldCheck",
        text: "Atendimento Direto",
      },
      {
        id: "hl-2",
        icon: "Building",
        text: "Porto Alegre & Todo o Brasil",
      },
    ],
  },
};

export const DEFAULT_TESTIMONIALS_CONTENT: CMSTestimonialsContent = {
  badgeText: "Depoimentos Reais",
  title: "O Que Dizem Nossos Clientes",
  subtitle: "A satisfação de quem confia na ICTHUS para transformar a imagem e a presença do seu negócio.",
  cards: [
    {
      id: "test-1",
      name: "Ricardo Mendonça",
      role: "Diretor de Expansão",
      company: "Rede Bella Farma",
      content: "A equipe do Glessios entregou as fachadas e a sinalização interna de 4 novas filiais rigorosamente no prazo. A qualidade do acabamento das letras caixa e a precisão do ACM superaram todas as nossas expectativas.",
      rating: 5,
      tag: "Fachadas & Sinalização",
    },
    {
      id: "test-2",
      name: "Patrícia Albuquerque",
      role: "Arquiteta Titular",
      company: "Studio P. Arquitetura",
      content: "Trabalhar com a Glessios é ter paz de espírito. Eles entendem de projeto, respeitam o desenho do arquiteto e sugerem materiais e otimizações de custos que realmente fazem a diferença.",
      rating: 5,
      tag: "Projetos Especiais & Parceria",
    },
    {
      id: "test-3",
      name: "Eduardo Silveira",
      role: "Fundador & CEO",
      company: "Grupo Nexus Tech",
      content: "Desde o redesenho da marca até as placas de inox e letreiros luminosos do nosso novo escritório, tudo foi centralizado em um só lugar. Menos dor de cabeça e resultado impecável.",
      rating: 5,
      tag: "Design & Produção Completa",
    },
  ],
};

export const DEFAULT_CONTACT_CONTENT: CMSGlobalContactContent = {
  whatsapp: {
    number: "5551981192976",
    formatted: "+55 51 98119.2976",
    defaultMessage: "Olá! Gostaria de saber mais sobre as soluções e orçamentos da ICTHUS / Glessios.",
  },
  phones: [
    {
      id: "tel-1",
      number: "+5551981192976",
      formatted: "+55 51 98119.2976 (w)",
      label: "WhatsApp / Celular",
      isWhatsapp: true,
    },
    {
      id: "tel-2",
      number: "+555135746167",
      formatted: "55 51 3574.6167",
      label: "Fixo Comercial",
      isWhatsapp: false,
    },
  ],
  emails: [
    {
      id: "mail-1",
      email: "glessios@hotmail.com",
      label: "Contato Principal",
    },
    {
      id: "mail-2",
      email: "glessios@gmail.com",
      label: "Orçamentos e Projetos",
    },
  ],
  address: {
    street: "Rua Buenos Aires",
    number: "437 / 203",
    complement: "",
    neighborhood: "Jardim Botânico",
    city: "Porto Alegre",
    state: "RS",
    zip: "90670-130",
    country: "Brasil",
  },
  socialLinks: {
    instagram: "https://instagram.com/glessios",
    facebook: "https://facebook.com/glessios",
  },
  footerNotice: "Atendimento Ativo — Porto Alegre & Todo o Brasil",
};

export const DEFAULT_PORTFOLIO_SECTION_CONTENT: CMSPortfolioSectionContent = {
  badgeText: "Galeria de Soluções",
  title: "Nosso Portfólio",
  subtitle: "Cada cliente é único. Não nos contentamos com soluções genéricas: desenvolvemos projetos exclusivos com o que há de mais moderno. Clique em qualquer trabalho para ver a apresentação completa com fotos, vídeos e detalhes técnicos da obra.",
  categories: [
    "Tudo",
    "Design",
    "Letreiros",
    "Placas",
    "Painéis",
    "Quadros",
    "Troféus",
    "Fachadas",
    "Outros",
  ],
};

export const DEFAULT_SITE_DATA: CMSCompleteSiteData = {
  hero: DEFAULT_HERO_CONTENT,
  solutions: DEFAULT_SOLUTIONS_CONTENT,
  about: DEFAULT_ABOUT_CONTENT,
  action_areas: DEFAULT_ACTION_AREAS_CONTENT,
  services: DEFAULT_SERVICES_CONTENT,
  team: DEFAULT_TEAM_CONTENT,
  testimonials: DEFAULT_TESTIMONIALS_CONTENT,
  contact_info: DEFAULT_CONTACT_CONTENT,
  portfolio: DEFAULT_PORTFOLIO_SECTION_CONTENT,
};
