import prisma from "@/lib/prisma";

export interface ProjectVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  tag: string;
}

export interface ProjectDetailItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  clientName: string;
  clientSegment: string;
  location: string;
  year: string;
  executionTime: string;
  dimensions: string;
  warranty: string;
  coverImage: string;
  featuredImage: string;
  galleryImages: {
    url: string;
    caption: string;
    category?: "Finalizado" | "Iluminação Noturna" | "Detalhes Técnicos" | "Montagem & Fábrica";
  }[];
  videos: ProjectVideo[];
  description: string;
  challenge: string;
  solution: string;
  results: string[];
  materials: string[];
  technicalSpecs: {
    label: string;
    value: string;
  }[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    company: string;
    rating: number;
  };
  tags: string[];
}

export const PORTFOLIO_PROJECTS: ProjectDetailItem[] = [
  {
    id: "proj-1",
    slug: "fachada-comercial-acm-led-tech-tower",
    title: "Fachada Comercial Estruturada em ACM & Letreiro LED",
    subtitle: "Modernização arquitetônica de 180m² com corte chanfrado em Router CNC e iluminação indireta Halo LED 6500K.",
    category: "Fachadas",
    clientName: "Tech Tower Empreendimentos",
    clientSegment: "Edifícios Corporativos & Centro Empresarial",
    location: "Porto Alegre, RS",
    year: "2026",
    executionTime: "18 dias úteis",
    dimensions: "180 m² de revestimento + Letreiro de 8 metros",
    warranty: "5 anos de garantia estrutural e 3 anos para módulos LED",
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1280&q=75",
    featuredImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=70",
    galleryImages: [
      {
        url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=70",
        caption: "Fachada principal corporativa com placas de ACM Grafite usinadas com precisão milimétrica",
        category: "Finalizado",
      },
      {
        url: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=70",
        caption: "Vista noturna com efeito Halo de retroiluminação LED 6500K sem pontos quentes",
        category: "Iluminação Noturna",
      },
      {
        url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=70",
        caption: "Detalhe de encaixe das chapas com usinagem em chanfro 45° e juntas estanques de dilatação",
        category: "Detalhes Técnicos",
      },
      {
        url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=70",
        caption: "Estrutura auxiliar tubular em aço galvanizado a fogo montada conforme cálculo estrutural ART",
        category: "Montagem & Fábrica",
      },
    ],
    videos: [
      {
        id: "vid-1",
        title: "Showcase Executivo & Bastidores da Fachada Tech Tower",
        description: "Confira o processo de engenharia, usinagem CNC e a imponência visual da entrega final.",
        videoUrl: "/videos/hero-background.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=70",
        duration: "0:45",
        tag: "Vídeo Oficial da Obra",
      },
    ],
    description:
      "A revitalização da sede corporativa da Tech Tower exigiu uma abordagem integral de engenharia e comunicação visual. O objetivo foi transformar um edifício tradicional em um ícone contemporâneo de design urbano. Utilizamos 180m² de placas de ACM 4mm grafite metálico com acabamento escovado, submetidas a usinagem em centro de usinagem Router CNC computadorizado, garantindo dobras perfeitas sem fissuras. O letreiro monumental conta com letras bloco em aço inoxidável AISI 304 escovado e retroiluminação indireta com lentes ópticas de difusão de 160°.",
    challenge:
      "A edificação apresentava irregularidades na alvenaria original e o cliente não podia interromper o fluxo diário de mais de 800 colaboradores e visitantes durante a execução da obra. Além disso, a região sofre ventos severos de inverno, exigindo laudo e ART de resistência mecânica.",
    solution:
      "Desenvolvemos um subchassi metálico tubular em balanço pré-fabricado em nossa indústria com galvanização por imersão a quente. Todo o corte e montagem de módulos de ACM foram realizados off-site na fábrica da Glessios, agilizando a instalação in loco para apenas 18 dias e eliminando ruídos em horário comercial.",
    results: [
      "Valorização estimada em mais de 35% na percepção estética do condomínio corporativo.",
      "Visibilidade noturna destacada a mais de 300 metros no corredor comercial.",
      "Zero manutenção corretiva com 100% de vedação e resistência comprovada a ventos de até 120 km/h.",
    ],
    materials: [
      "ACM Grafite 4mm com proteção UV Kynar 500",
      "Aço Inox 304 escovado anticorrosivo",
      "Módulos LED 6500K Injetados IP68",
      "Estrutura tubular galvanizada a quente",
      "Fontes chaveadas blindadas IP67",
      "Fixadores em aço inoxidável e parafusos estruturais",
    ],
    technicalSpecs: [
      { label: "Área Total Revestida", value: "180 m²" },
      { label: "Espessura do ACM", value: "4,0 mm com lâmina de alumínio 0,30mm" },
      { label: "Tipo de Letras", value: "Caixa alta em Aço Inox 304 com solda micro-TIG" },
      { label: "Iluminação", value: "LED Halo com difusão indireta 6500K (Luz Fria)" },
      { label: "Norma de Segurança", value: "NR-35 (Trabalho em Altura) com ART de Engenharia" },
      { label: "Consumo Elétrico", value: "Redução de 60% com fontes eletrônicas de alto rendimento" },
    ],
    testimonial: {
      quote:
        "A transformação do prédio foi impressionante. A Glessios entregou antes do prazo contratual e com um padrão de acabamento que chamou a atenção de todo o mercado imobiliário da região.",
      author: "Carlos Eduardo Menezes",
      role: "Diretor de Operações Imobiliárias",
      company: "Tech Tower Empreendimentos",
      rating: 5,
    },
    tags: ["ACM", "Fachada Comercial", "Letreiro LED", "Aço Inox", "Engenharia Visual", "Porto Alegre"],
  },
  {
    id: "proj-2",
    slug: "letreiro-caixa-acrilico-neon-boutique-lumina",
    title: "Letreiro Caixa Acrílico Cristal & Neon Glow",
    subtitle: "Tipografia escultural de alto relevo usinada a laser em acrílico 10mm com iluminação difusa branco quente 3000K.",
    category: "Letreiros",
    clientName: "Boutique Lumina",
    clientSegment: "Moda Premium & Varejo de Luxo",
    location: "Porto Alegre, RS",
    year: "2026",
    executionTime: "7 dias úteis",
    dimensions: "Letreiro com 4,20 metros de extensão frontal",
    warranty: "3 anos de garantia integral de componentes luminosos",
    coverImage: "https://images.unsplash.com/photo-1518334792104-db78a16ac8b8?auto=format&fit=crop&w=1280&q=75",
    featuredImage: "https://images.unsplash.com/photo-1518334792104-db78a16ac8b8?auto=format&fit=crop&w=800&q=70",
    galleryImages: [
      {
        url: "https://images.unsplash.com/photo-1518334792104-db78a16ac8b8?auto=format&fit=crop&w=800&q=70",
        caption: "Letras em alto relevo com acabamento espelhado e brilho luminoso aconchegante",
        category: "Finalizado",
      },
      {
        url: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=70",
        caption: "Iluminação noturna com temperatura de cor 3000K que valoriza a sofisticação da boutique",
        category: "Iluminação Noturna",
      },
      {
        url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=70",
        caption: "Corte a laser de alta definição sem rebarbas com polimento térmico nas bordas",
        category: "Detalhes Técnicos",
      },
    ],
    videos: [
      {
        id: "vid-2",
        title: "Efeito Visual e Brilho das Letras Caixa Lumina",
        description: "Assista aos detalhes de reflexo do acrílico cast cristal e da iluminação uniforme.",
        videoUrl: "/videos/hero-background.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1518334792104-db78a16ac8b8?auto=format&fit=crop&w=800&q=70",
        duration: "0:30",
        tag: "Showcase Iluminação",
      },
    ],
    description:
      "Para a nova flagship da Boutique Lumina, desenvolvemos um letreiro em letras caixa termoformadas com frontal em acrílico cast cristal 10mm polido a diamante e laterais em polímero nobre. O diferencial do projeto é o sistema óptico interno com filtros difusores de silício, que garantem distribuição de luz homogênea em 360 graus sem nenhum ponto escuro ou superaquecido.",
    challenge:
      "A identidade da loja pedia um clima intimista, sofisticado e acolhedor, onde letreiros brancos convencionais ficariam frios e desarmônicos com o projeto de iluminação assinado por arquitetos renomados.",
    solution:
      "Adotamos fitas de LED de altíssimo índice de reprodução de cor (IRC > 95) em temperatura de 3000K (branco suave/quente), combinadas com acrílico opalescente leitoso de 4mm na face traseira para criar uma aura dourada suave contra a parede de mármore travertino.",
    results: [
      "Aumento imediato de fotos da vitrine postadas por clientes nas redes sociais.",
      "Identidade luminosa perfeitamente calibrada com as luminárias de design da loja.",
      "Baixíssimo consumo energético de apenas 85W com durabilidade de 50.000 horas.",
    ],
    materials: [
      "Acrílico Cast 10mm Cristal Virgem 100%",
      "Módulos LED Branco Quente 3000K IRC > 95",
      "Laterais Termoformadas com proteção anti-UV",
      "Base de ancoragem oculta em alumínio anodizado",
    ],
    technicalSpecs: [
      { label: "Altura da Letra Maior", value: "48 cm" },
      { label: "Espessura Total do Relevo", value: "70 mm" },
      { label: "Temperatura de Cor", value: "3000K (Branco Quente Suave)" },
      { label: "Alimentação Elétrica", value: "12V CC com fonte estabilizada embutida" },
      { label: "Fixação", value: "Pinos roscados invisíveis em buchas especiais" },
    ],
    testimonial: {
      quote:
        "O letreiro ficou uma verdadeira joia na entrada da loja! O tom da luz combinou exatamente com o ambiente e nossos clientes elogiam constantemente.",
      author: "Helena Castro",
      role: "Fundadora e Curadora de Estilo",
      company: "Boutique Lumina",
      rating: 5,
    },
    tags: ["Letreiro Caixa", "Acrílico Cristal", "LED 3000K", "Design de Luxo", "Varejo Premium"],
  },
  {
    id: "proj-3",
    slug: "identidade-visual-branding-studio-aurora",
    title: "Identidade Visual & Branding Corporativo",
    subtitle: "Concepção completa de marca, manual de uso, tipografia proprietária e aplicação em papelaria com acabamento premium.",
    category: "Design",
    clientName: "Studio Aurora Criativo",
    clientSegment: "Arquitetura & Engenharia de Interiores",
    location: "Porto Alegre, RS",
    year: "2026",
    executionTime: "12 dias úteis",
    dimensions: "Guia de Marca Completo (80 páginas) + Peças Institucionais",
    warranty: "Cessão definitiva de direitos autorais e arquivos abertos em vetor",
    coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1280&q=75",
    featuredImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=70",
    galleryImages: [
      {
        url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=70",
        caption: "Apresentação conceitual do monograma e grid de construção geométrica da marca",
        category: "Finalizado",
      },
      {
        url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=70",
        caption: "Papelaria corporativa impressa em papel Colorplus com aplicação de verniz UV e hot stamping",
        category: "Detalhes Técnicos",
      },
    ],
    videos: [
      {
        id: "vid-3",
        title: "Apresentação da Identidade e Brandbook Studio Aurora",
        description: "Assista à animação do logotipo e aos desdobramentos de comunicação criados pela Glessios.",
        videoUrl: "/videos/hero-background.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=70",
        duration: "0:40",
        tag: "Motion & Branding",
      },
    ],
    description:
      "A criação da identidade do Studio Aurora foi pautada na simbiose entre arte e precisão arquitetônica. O símbolo sintetiza a passagem de luz natural e a estrutura espacial dos projetos desenvolvidos pelo escritório. O projeto incluiu manual técnico de aplicação de marca, paleta cromática com códigos CMYK, RGB, Pantone e HEX, além de material de apresentação para concorrências de alto padrão.",
    challenge:
      "O cliente possuía uma marca antiga com estética genérica que não transmitia o valor dos projetos multimilionários que o escritório executava para clientes de alto padrão.",
    solution:
      "Desenvolvemos um redesign audacioso com tipografia sans-serif de peso contemporâneo e linhas puras, desdobrado em cartões de visita com laminação soft-touch em papel 600g e borda pintada em cobre metálico.",
    results: [
      "Posicionamento consolidado no segmento de arquitetura de luxo.",
      "Aumento na taxa de conversão de novos contratos de projetos residenciais.",
      "Padronização unificada em todas as mídias digitais e impressas.",
    ],
    materials: [
      "Manual de Marca em PDF Interativo de Alta Resolução",
      "Papel Algodão Importado 600g para Papelaria",
      "Hot Stamping Cobre Metálico",
      "Verniz Localizado com Relevo Seco",
    ],
    technicalSpecs: [
      { label: "Entrega Digital", value: "Vetores em AI, EPS, SVG, PDF e PNG de alta resolução" },
      { label: "Padrão de Cores", value: "Escala Pantone® Matching System + CMYK/RGB" },
      { label: "Manual de Marca", value: "Regras de uso, áreas de resguardo e proibições" },
      { label: "Aplicações Gráficas", value: "Papelaria, crachás, uniformes, envelopes e pastas" },
    ],
    testimonial: {
      quote:
        "A equipe da Glessios conseguiu captar a essência da nossa alma criativa. Quando apresentamos nossa proposta com a nova identidade aos clientes, a credibilidade é imediata.",
      author: "Juliana Silveira",
      role: "Arquiteta Titular",
      company: "Studio Aurora Criativo",
      rating: 5,
    },
    tags: ["Branding", "Design Gráfico", "Manual de Marca", "Papelaria de Luxo", "Hot Stamping"],
  },
  {
    id: "proj-4",
    slug: "placas-sinalizacao-arquitetonica-inox-centro-medico",
    title: "Placas de Sinalização Arquitetônica em Inox Escovado",
    subtitle: "Sistema integrado de wayfinding e sinalização clínica em aço inoxidável escovado com gravação química de alta durabilidade.",
    category: "Placas",
    clientName: "Centro Médico Jardim Botânico",
    clientSegment: "Saúde & Clínicas Multiespecialidades",
    location: "Porto Alegre, RS",
    year: "2026",
    executionTime: "10 dias úteis",
    dimensions: "Mais de 120 placas distribuídas em 4 andares",
    warranty: "Garantia vitalícia contra oxidação do aço inox 304",
    coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1280&q=75",
    featuredImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=70",
    galleryImages: [
      {
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=70",
        caption: "Placas indicativas de consultórios com gravação indelével e tarugos cromados",
        category: "Finalizado",
      },
      {
        url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=70",
        caption: "Diretório geral de médicos no hall de entrada com sistema modular de troca rápida",
        category: "Detalhes Técnicos",
      },
    ],
    videos: [
      {
        id: "vid-4",
        title: "Instalação e Fluidez da Sinalização no Centro Médico",
        description: "Veja como a sinalização facilitou a orientação dos pacientes e o visual asséptico elegante.",
        videoUrl: "/videos/hero-background.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=70",
        duration: "0:35",
        tag: "Wayfinding Hospitalar",
      },
    ],
    description:
      "O projeto de wayfinding para o Centro Médico Jardim Botânico contemplou placas de identificação de salas de exame, consultórios, rotas de emergência com pictogramas fotoluminescentes e diretório principal de especialidades. A matéria-prima escolhida foi o aço inox 304 com acabamento escovado Scotch-Brite e gravação profunda por corrosão química preenchida com esmalte sintético curado em estufa.",
    challenge:
      "Ambientes hospitalares e clínicos utilizam produtos químicos pesados de assepsia e limpeza diária que corroem tintas comuns e adesivos convencionais em poucos meses.",
    solution:
      "A gravação química indelével com baixo relevo e esmalte de alta resistência garantiu imunidade absoluta a álcool 70%, hipoclorito e germicidas hospitalares.",
    results: [
      "Total eliminação de desorientação de pacientes nos 4 andares.",
      "Durabilidade inalterada mesmo após limpezas hospitalares diárias intensas.",
      "Conformidade rigorosa com normas técnicas de acessibilidade e segurança NBR 9050.",
    ],
    materials: [
      "Aço Inox AISI 304 Escovado 1,5mm",
      "Gravação Química Profunda com cura em estufa",
      "Espaçadores e tarugos em latão cromado e alumínio anodizado",
      "Película fotoluminescente de segurança para rotas de fuga",
    ],
    technicalSpecs: [
      { label: "Quantidade de Peças", value: "128 placas de porta, totens e diretórios" },
      { label: "Fixação", value: "Tarugos com distanciador de 15mm da parede" },
      { label: "Resistência", value: "Imune a álcool isopropílico, álcool 70% e desinfetantes hospitalares" },
      { label: "Braille e Acessibilidade", value: "Esferas de inox prensadas com relevo tátil certificado" },
    ],
    testimonial: {
      quote:
        "A qualidade da sinalização da Glessios elevou o padrão do nosso centro médico. O acabamento em inox é higiênico, sofisticado e as placas continuam impecáveis.",
      author: "Dr. Marcelo Antunes",
      role: "Diretor Clínico",
      company: "Centro Médico Jardim Botânico",
      rating: 5,
    },
    tags: ["Sinalização", "Aço Inox", "Placas Médicas", "Wayfinding", "Acessibilidade"],
  },
  {
    id: "proj-5",
    slug: "painel-ripado-router-cnc-alpha-medicina",
    title: "Painel Decorativo Ripado Usinado em Router CNC",
    subtitle: "Estrutura cenográfica em relevo 3D ripado com logotipo vazado em acrílico ouro espelhado e retroiluminação COB.",
    category: "Painéis",
    clientName: "Alpha Medicina Integrada",
    clientSegment: "Clínica de Estética & Bem-Estar",
    location: "Porto Alegre, RS",
    year: "2026",
    executionTime: "9 dias úteis",
    dimensions: "6,50m de largura por 2,80m de altura",
    warranty: "5 anos contra empenamento de madeira e descolamento",
    coverImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1280&q=75",
    featuredImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=70",
    galleryImages: [
      {
        url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=70",
        caption: "Recepção principal com painel ripado e luz indireta contínua",
        category: "Finalizado",
      },
      {
        url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=70",
        caption: "Detalhe do logotipo em acrílico espelhado dourado cortado na Router CNC",
        category: "Detalhes Técnicos",
      },
    ],
    videos: [
      {
        id: "vid-5",
        title: "Usinagem na Router CNC e Acabamento do Painel Alpha",
        description: "Veja o processo automatizado de corte milimétrico e o encaixe das ripas na fábrica.",
        videoUrl: "/videos/hero-background.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=70",
        duration: "0:45",
        tag: "Fábrica & Produção CNC",
      },
    ],
    description:
      "Criação e execução do painel central de recepção da clínica Alpha Medicina. A proposta arquitetônica uniu a sensação térmica aconchegante do painel ripado com a sofisticação do acrílico espelhado dourado e iluminação linear oculta em fita LED COB contínua (sem pontos de luz visíveis).",
    challenge:
      "A recepção contava com pé-direito alto e o cliente desejava camuflar a fiação dos equipamentos de atendimento e o quadro de disjuntores que ficavam visíveis na parede de entrada.",
    solution:
      "Projetamos um sistema ripado articulado inteligente na Router CNC com painéis de acesso invisíveis com fecho magnético de pressão, permitindo manutenção elétrica sem qualquer parafuso aparente.",
    results: [
      "Ambiente de espera transformado em experiência sensorial de clínica boutique.",
      "Ocultação perfeita de toda a infraestrutura técnica predial.",
      "Excelente absorção acústica e conforto visual para clientes em espera.",
    ],
    materials: [
      "MDF Naval e Carvalho Natural tratado contra umidade",
      "Acrílico Espelhado Dourado 3mm de Alta Refletância",
      "Fita LED COB Contínua 3000K 480 LEDs/metro",
      "Ferragens de fixação oculta alemãs",
    ],
    technicalSpecs: [
      { label: "Espaçamento Entre Ripas", value: "15 mm com tolerância zero" },
      { label: "Usinagem", value: "Corte em fresa de 2 cortes helicoidais em Router CNC" },
      { label: "Tecnologia LED", value: "Fita COB linear sem pontos de sombra" },
      { label: "Acesso de Manutenção", value: "Portas secretas integradas no ripado" },
    ],
    testimonial: {
      quote:
        "O painel foi o ponto alto do nosso projeto de interiores. Todos os médicos e pacientes elogiam o bom gosto da recepção assim que entram.",
      author: "Dra. Patrícia Silvestre",
      role: "Sócia-Fundadora",
      company: "Alpha Medicina Integrada",
      rating: 5,
    },
    tags: ["Painel Ripado", "Router CNC", "Acrílico Espelhado", "LED COB", "Interiores Comerciais"],
  },
  {
    id: "proj-6",
    slug: "quadros-corporativos-uv-acrilico-silveira-advocacia",
    title: "Quadros Corporativos de Alta Definição & Acrílico",
    subtitle: "Galeria de arte institucional com impressão UV direta sobre acrílico ótico translúcido e molduras metálicas slim.",
    category: "Quadros",
    clientName: "Advocacia Silveira & Associados",
    clientSegment: "Direito Empresarial & Tributário",
    location: "Porto Alegre, RS",
    year: "2026",
    executionTime: "5 dias úteis",
    dimensions: "Coleção com 12 quadros de 1,20m x 0,80m",
    warranty: "10 anos de fidelidade cromática sem desbotamento sob luz interna",
    coverImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1280&q=75",
    featuredImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=70",
    galleryImages: [
      {
        url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=70",
        caption: "Sala de reuniões executiva com quadros em acrílico cristal e impressão UV reversa",
        category: "Finalizado",
      },
      {
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=70",
        caption: "Detalhe da moldura de alumínio anodizado preto fosco com perfil ultrafino de 8mm",
        category: "Detalhes Técnicos",
      },
    ],
    videos: [
      {
        id: "vid-6",
        title: "Impressão UV em Mesa Plana e Montagem dos Quadros",
        description: "Veja a cura instantânea por luz ultravioleta e a profundidade de cor alcançada.",
        videoUrl: "/videos/hero-background.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=70",
        duration: "0:30",
        tag: "Tecnologia de Impressão UV",
      },
    ],
    description:
      "Produção de acervo visual para as salas de reuniões e diretoria da Silveira Advogados. As obras retratam marcos históricos da arquitetura jurídica brasileira com impressão digital UV fotográfica realizada no verso do acrílico cristal virgem, com dupla camada de tinta branca de bloqueio (White Ink), criando uma profundidade tridimensional única de imagem que parece flutuar sobre a parede.",
    challenge:
      "A iluminação direta com spots halógenos na sala de conferências causava reflexos que ofuscavam quadros com vidros convencionais.",
    solution:
      "Utilizamos acrílico especial com tratamento anti-reflexo e impressão reversa com cura ultravioleta LED, eliminando reflexos indesejados e dispensando o uso de vidros pesados e suscetíveis a quebra.",
    results: [
      "Decoração sóbria, elegante e alinhada à seriedade jurídica do escritório.",
      "Segurança total contra quedas, com peças leves e fixadores ocultos de pressão.",
      "Cores vibrantes com garantia de 10 anos contra desbotamento por luz artificial.",
    ],
    materials: [
      "Acrílico Ótico Cast 5mm com bordas facetadas",
      "Impressão UV Flatbed em 1440 DPI reais",
      "Tinta Branca Opaca de Alta Densidade",
      "Perfis de alumínio estrutural anodizado preto fosco",
    ],
    technicalSpecs: [
      { label: "Resolução de Impressão", value: "1440 x 1440 DPI fotográfico de alta precisão" },
      { label: "Método de Impressão", value: "Cura UV direta na mesa plana industrial" },
      { label: "Camadas de Tinta", value: "Color + White Masking + Blackout protetor" },
      { label: "Sistema de Suspensão", value: "Trilho francês em alumínio (French Cleat)" },
    ],
    testimonial: {
      quote:
        "Os quadros deram um ar de modernidade e sofisticação à nossa banca que impressionou nossos clientes corporativos desde o primeiro dia.",
      author: "Rodrigo Silveira",
      role: "Sócio Administrador",
      company: "Silveira & Associados",
      rating: 5,
    },
    tags: ["Quadros Decorativos", "Impressão UV", "Acrílico", "Decoração Corporativa", "Alta Resolução"],
  },
  {
    id: "proj-7",
    slug: "trofeus-metal-acrilico-premio-destaque-rs",
    title: "Troféus Personalizados em Metal e Acrílico Maciço",
    subtitle: "Peças exclusivas de premiação corporativa com escultura a laser em acrílico 15mm e base em aço escovado.",
    category: "Troféus",
    clientName: "Prêmio Destaque Empresarial RS",
    clientSegment: "Premiações, Eventos & Homenagens Corporativas",
    location: "Porto Alegre, RS",
    year: "2026",
    executionTime: "6 dias úteis",
    dimensions: "Lote de 40 troféus exclusivos com 28cm de altura",
    warranty: "Embalagem individual aveludada de luxo com estojo rígido",
    coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1280&q=75",
    featuredImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=70",
    galleryImages: [
      {
        url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=70",
        caption: "Troféus finalizados com sobreposição de camadas metálicas e acrílico transparente",
        category: "Finalizado",
      },
      {
        url: "https://images.unsplash.com/photo-1518334792104-db78a16ac8b8?auto=format&fit=crop&w=800&q=70",
        caption: "Gravação a fibra laser com o nome dos homenageados e brasão institucional",
        category: "Detalhes Técnicos",
      },
    ],
    videos: [
      {
        id: "vid-7",
        title: "Corte a Laser e Gravação Personalizada dos Troféus",
        description: "Assista à precisão cirúrgica do laser de fibra personalizando cada peça individual.",
        videoUrl: "/videos/hero-background.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=70",
        duration: "0:25",
        tag: "Personalização a Laser",
      },
    ],
    description:
      "A edição comemorativa do Prêmio Destaque Empresarial RS solicitou uma premiação que fugisse dos troféus genéricos de mercado. Criamos uma escultura tridimensional combinando acrílico maciço de 15mm lapidado em ângulos facetados que refletem a luz ambiente como um cristal, fixado sobre uma base sólida usinada em barra maciça de aço escovado.",
    challenge:
      "A lista definitiva com os nomes dos 40 ganhadores das categorias só foi liberada pela comissão julgadora 48 horas antes da noite de gala da premiação.",
    solution:
      "Montamos previamente os corpos esculturais dos troféus e deixamos a personalização nominal para gravação em fibra laser de alta velocidade em nosso laboratório, entregando as 40 peças conferidas, polidas e embaladas 12 horas antes da abertura do evento.",
    results: [
      "Sucesso absoluto entre as maiores lideranças empresariais do estado.",
      "Peças memoráveis com peso expressivo de 1,8 kg que conferem autoridade e nobreza ao prêmio.",
      "Contrato renovado automaticamente para as próximas 3 edições do evento.",
    ],
    materials: [
      "Acrílico Maciço Cast Cristal de 15mm",
      "Base usinada em Aço Inox 304 Maciço Escovado",
      "Gravação por Fibra Laser MOPA de alta definição",
      "Estojo de veludo preto com berço termoformado",
    ],
    technicalSpecs: [
      { label: "Altura e Peso", value: "28 cm de altura com 1,8 kg por peça" },
      { label: "Tecnologia de Corte", value: "Laser CO2 de 150W com borda polida a fogo" },
      { label: "Gravação Nominal", value: "Laser de Fibra de 50W com microrrelevo indelével" },
      { label: "Embalagem", value: "Estojo rígido luxo com fechamento magnético" },
    ],
    testimonial: {
      quote:
        "Os homenageados ficaram extasiados com a beleza e o peso dos troféus. O profissionalismo e a pontualidade da Glessios salvaram nosso cronograma apertado.",
      author: "Vanessa Becker",
      role: "Diretora de Eventos Corporativos",
      company: "Prêmio Destaque RS",
      rating: 5,
    },
    tags: ["Troféus", "Corte Laser", "Aço Maciço", "Acrílico 15mm", "Eventos Corporativos"],
  },
  {
    id: "proj-8",
    slug: "portico-monolitico-totem-auto-premium",
    title: "Pórtico Monolítico & Totem Iluminado",
    subtitle: "Marco arquitetônico monumental com pórtico autoportante de 8 metros e totem de sinalização rodoviária com lona backlight tensionada.",
    category: "Outros",
    clientName: "Auto Premium Concessionária",
    clientSegment: "Concessionárias & Automotivo",
    location: "Porto Alegre, RS",
    year: "2026",
    executionTime: "22 dias úteis",
    dimensions: "Pórtico com vão livre de 14 metros + Totem de 6 metros de altura",
    warranty: "10 anos de estabilidade estrutural com laudo de engenharia civil",
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1280&q=75",
    featuredImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=70",
    galleryImages: [
      {
        url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=70",
        caption: "Entrada monumental da concessionária com pórtico em ACM preto fosco",
        category: "Finalizado",
      },
      {
        url: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=70",
        caption: "Totem rodoviário com iluminação backlight uniforme de alta potência visível a longa distância",
        category: "Iluminação Noturna",
      },
      {
        url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=70",
        caption: "Içamento da viga metálica principal com caminhão munck e equipe certificada NR-35",
        category: "Montagem & Fábrica",
      },
    ],
    videos: [
      {
        id: "vid-8",
        title: "Içamento Estrutural e Entrega do Pórtico Auto Premium",
        description: "Acompanhe a operação de engenharia pesada, içamento e acendimento noturno.",
        videoUrl: "/videos/hero-background.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=70",
        duration: "0:50",
        tag: "Engenharia de Grande Porte",
      },
    ],
    description:
      "Execução de sinalização externa monumental para concessionária de veículos premium às margens de rodovia de alta velocidade. A obra compreendeu a fundação em concreto armado, montagem de treliças metálicas em vigas I de aço estrutural ASTM A36, envelopamento em ACM preto fosco com pintura arquitetônica e totem frontal de 6 metros com lona backlight de alta gramatura e iluminação por refletores LED de longo alcance.",
    challenge:
      "A instalação ocorreu à beira de rodovia com intenso tráfego de caminhões e forte ação de ventos de campo aberto, exigindo aprovação prévia em órgãos de trânsito e cálculos de fundação por estacas profundas.",
    solution:
      "Nossa equipe de engenharia emitiu toda a documentação de ART, realizou sondagem de solo e executou as sapatas de ancoragem com chumbadores de 1.1/4 polegadas. O içamento foi concluído em operação noturna de 4 horas sem interrupção de tráfego.",
    results: [
      "Concessionária tornou-se ponto de referência geográfico imediato na rodovia.",
      "Aumento de 50% na entrada de clientes espontâneos na loja física.",
      "Estrutura homologada e aprovada sem ressalvas pela fiscalização técnica.",
    ],
    materials: [
      "Vigas metálicas em Aço ASTM A36 galvanizadas",
      "ACM Preto Fosco 4mm com proteção antifuligem",
      "Lona Backlight 500g com verniz de proteção antimofo",
      "Módulos LED de alta penetração luminosa com lentes colimadoras",
    ],
    technicalSpecs: [
      { label: "Altura Máxima", value: "8,20 metros com vão livre de 14 metros" },
      { label: "Resistência a Ventos", value: "Calculado para ventos de até 145 km/h (NBR 6123)" },
      { label: "Fundação", value: "4 brocas de concreto armado com 6 metros de profundidade" },
      { label: "Operação de Montagem", value: "Guindaste telescópico munck com ART e NR-11/NR-35" },
    ],
    testimonial: {
      quote:
        "A imponência dessa obra colocou nossa concessionária em outro patamar de destaque na rodovia. A segurança e a capacidade técnica da Glessios são incomparáveis.",
      author: "Fernando Albuquerque",
      role: "Diretor Comercial Regional",
      company: "Auto Premium Concessionária",
      rating: 5,
    },
    tags: ["Pórtico Monumental", "Totem Iluminado", "Engenharia Pesada", "Estrutura Metálica", "ACM"],
  },
];

/**
 * Recupera um projeto por slug ou por ID, com suporte a consulta no banco de dados Prisma
 * e fallback automático para a base detalhada local.
 */
export async function getProjectBySlugOrId(identifier: string): Promise<ProjectDetailItem | null> {
  const decoded = decodeURIComponent(identifier).trim();

  // 1. Busca primeiro na base de dados de alta riqueza
  const foundLocal = PORTFOLIO_PROJECTS.find(
    (p) => p.slug === decoded || p.id === decoded || p.slug.toLowerCase() === decoded.toLowerCase()
  );

  if (foundLocal) {
    return foundLocal;
  }

  // 2. Se não estiver local, busca no banco de dados Prisma
  try {
    const dbProject = await prisma.portfolioProject.findFirst({
      where: {
        OR: [{ slug: decoded }, { id: decoded }],
      },
    });

    if (dbProject) {
      return {
        id: dbProject.id,
        slug: dbProject.slug,
        title: dbProject.title,
        subtitle: `${dbProject.category} executada com excelência para ${dbProject.clientName || "Cliente Especial"}.`,
        category: dbProject.category,
        clientName: dbProject.clientName || "Cliente Glessios",
        clientSegment: "Comunicação Visual Corporativa",
        location: "Porto Alegre, RS",
        year: dbProject.completedAt ? dbProject.completedAt.getFullYear().toString() : "2026",
        executionTime: "Sob Medida",
        dimensions: "Conforme Projeto Aprovado",
        warranty: "Garantia Integral Glessios",
        coverImage: dbProject.featuredImage,
        featuredImage: dbProject.featuredImage,
        galleryImages: (dbProject.galleryImages && dbProject.galleryImages.length > 0
          ? dbProject.galleryImages
          : [dbProject.featuredImage]
        ).map((url, i) => ({
          url,
          caption: `Foto ${i + 1} da execução do projeto ${dbProject.title}`,
          category: "Finalizado",
        })),
        videos: [
          {
            id: `vid-db-${dbProject.id}`,
            title: `Vídeo da Obra — ${dbProject.title}`,
            description: "Showcase dos detalhes de acabamento e iluminação realizados pela equipe Glessios.",
            videoUrl: "/videos/hero-background.mp4",
            thumbnailUrl: dbProject.featuredImage,
            duration: "0:30",
            tag: "Apresentação da Obra",
          },
        ],
        description: dbProject.description,
        challenge: "Desenvolver uma solução sob medida com acabamento impecável e alta durabilidade.",
        solution: "Aplicação dos mais nobres materiais do setor com projeto de engenharia e montagem técnica.",
        results: [
          "Destaque e valorização da marca do cliente perante seu público.",
          "Entrega pontual com controle rígido de qualidade em fábrica.",
          "Durabilidade e resistência garantidas.",
        ],
        materials: dbProject.tags && dbProject.tags.length > 0 ? dbProject.tags : ["ACM", "LED", "Acrílico"],
        technicalSpecs: [
          { label: "Categoria", value: dbProject.category },
          { label: "Cliente", value: dbProject.clientName || "Cliente Glessios" },
          { label: "Garantia", value: "Garantia com suporte técnico Glessios" },
        ],
        tags: dbProject.tags || [dbProject.category],
      };
    }
  } catch (error) {
    console.warn("Aviso ao buscar projeto no banco de dados:", error);
  }

  return null;
}

/**
 * Retorna todos os projetos para listagem e sitemap
 */
export async function getAllProjects(): Promise<ProjectDetailItem[]> {
  try {
    const dbProjects = await prisma.portfolioProject.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (dbProjects && dbProjects.length > 0) {
      // Mescla projetos locais com os do banco que não estão na lista
      const localSlugs = new Set(PORTFOLIO_PROJECTS.map((p) => p.slug));
      const additionalProjects: ProjectDetailItem[] = dbProjects
        .filter((dbp) => !localSlugs.has(dbp.slug))
        .map((dbp) => ({
          id: dbp.id,
          slug: dbp.slug,
          title: dbp.title,
          subtitle: `${dbp.category} executada com excelência para ${dbp.clientName || "Cliente Especial"}.`,
          category: dbp.category,
          clientName: dbp.clientName || "Cliente Glessios",
          clientSegment: "Comunicação Visual Corporativa",
          location: "Porto Alegre, RS",
          year: dbp.completedAt ? dbp.completedAt.getFullYear().toString() : "2026",
          executionTime: "Sob Medida",
          dimensions: "Conforme Projeto Aprovado",
          warranty: "Garantia Integral Glessios",
          coverImage: dbp.featuredImage,
          featuredImage: dbp.featuredImage,
          galleryImages: (dbp.galleryImages && dbp.galleryImages.length > 0
            ? dbp.galleryImages
            : [dbp.featuredImage]
          ).map((url, i) => ({
            url,
            caption: `Foto ${i + 1} do projeto ${dbp.title}`,
            category: "Finalizado",
          })),
          videos: [
            {
              id: `vid-db-${dbp.id}`,
              title: `Vídeo da Obra — ${dbp.title}`,
              description: "Showcase dos detalhes de acabamento e iluminação realizados pela equipe Glessios.",
              videoUrl: "/videos/hero-background.mp4",
              thumbnailUrl: dbp.featuredImage,
              duration: "0:30",
              tag: "Apresentação da Obra",
            },
          ],
          description: dbp.description,
          challenge: "Desenvolver uma solução sob medida com acabamento impecável e alta durabilidade.",
          solution: "Aplicação dos mais nobres materiais do setor com projeto de engenharia e montagem técnica.",
          results: [
            "Destaque e valorização da marca do cliente perante seu público.",
            "Entrega pontual com controle rígido de qualidade em fábrica.",
          ],
          materials: dbp.tags && dbp.tags.length > 0 ? dbp.tags : ["ACM", "LED", "Acrílico"],
          technicalSpecs: [
            { label: "Categoria", value: dbp.category },
            { label: "Cliente", value: dbp.clientName || "Cliente Glessios" },
          ],
          tags: dbp.tags || [dbp.category],
        }));

      return [...PORTFOLIO_PROJECTS, ...additionalProjects];
    }
  } catch (error) {
    console.warn("Aviso ao buscar lista de projetos no banco de dados:", error);
  }

  return PORTFOLIO_PROJECTS;
}
