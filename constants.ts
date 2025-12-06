import { Job } from './types';

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Engenheiro de Software Senior (React/Node)',
    department: 'Engenharia',
    location: 'São Paulo, SP',
    type: 'Remoto',
    description: 'Estamos em busca de uma pessoa Engenheira de Software Sênior para elevar o nível técnico do nosso time de Plataforma. Você atuará no desenvolvimento de soluções escaláveis para nosso SaaS, participando ativamente de decisões de arquitetura e design de sistemas. Além de codificar, esperamos que você atue como referência técnica, realizando Code Reviews criteriosos e mentoreando desenvolvedores plenos e júniores. Se você é apaixonado por Clean Code, testes automatizados e performance, seu lugar é aqui.',
    requirements: [
      '5+ anos de experiência com JavaScript/TypeScript',
      'Domínio avançado de React.js (Hooks, Context, Performance) e Node.js',
      'Experiência comprovada com arquitetura de microsserviços e sistemas distribuídos',
      'Vivência com Cloud Providers (AWS ou GCP) e ferramentas de CI/CD',
      'Inglês avançado para leitura técnica e comunicação escrita'
    ]
  },
  {
    id: '2',
    title: 'Product Manager',
    department: 'Produto',
    location: 'Rio de Janeiro, RJ',
    type: 'Híbrido',
    description: 'Como Product Manager, você será o "CEO" do produto, liderando a estratégia desde a concepção até o lançamento (End-to-End). Você trabalhará em estreita colaboração com UX Designers e Engenheiros para resolver dores reais dos nossos clientes B2B. O dia a dia envolve muita análise de dados para tomada de decisão, condução de processos de Product Discovery e priorização de backlog baseada em valor de negócio. Buscamos alguém com visão analítica aguçada e excelente capacidade de comunicação com stakeholders.',
    requirements: [
      '3+ anos de experiência como PM em produtos digitais B2B ou SaaS',
      'Domínio de metodologias ágeis e frameworks de priorização (RICE, WSJF)',
      'Forte capacidade analítica (SQL e análise de métricas de produto)',
      'Experiência com Discovery contínuo e entrevistas com usuários'
    ]
  },
  {
    id: '3',
    title: 'Analista de Dados Pleno',
    department: 'Data & Analytics',
    location: 'Belo Horizonte, MG',
    type: 'Presencial',
    description: 'Junte-se ao nosso time de Data & Analytics para transformar dados brutos em insights estratégicos. Você será responsável por sustentar e evoluir nossos pipelines de dados e criar visualizações que empoderem as áreas de Marketing e Vendas. Buscamos um perfil proativo, que não apenas atenda demandas de relatórios, mas que investigue os dados para responder perguntas de negócio complexas ("Por que o churn aumentou?", "Qual o LTV por canal?").',
    requirements: [
      'Domínio de SQL para consultas complexas e otimização',
      'Experiência sólida com Python para manipulação de dados (Pandas/NumPy)',
      'Experiência na construção de dashboards em PowerBI, Tableau ou Looker',
      'Conhecimento de conceitos de Data Warehouse e modelagem dimensional'
    ]
  },
  {
    id: '4',
    title: 'UX/UI Designer Senior',
    department: 'Design',
    location: 'Florianópolis, SC',
    type: 'Remoto',
    description: 'Buscamos um(a) UX/UI Designer Senior obcecado(a) pela experiência do usuário. Você liderará o design de novas features do nosso aplicativo mobile e web, garantindo consistência visual e usabilidade. Sua rotina incluirá desde a facilitação de workshops e pesquisas com usuários até a entrega de protótipos de alta fidelidade e handoff para os desenvolvedores. É essencial ter experiência na construção e manutenção de Design Systems.',
    requirements: [
      'Portfólio robusto com cases de UX (processo) e UI (visual)',
      'Domínio avançado de Figma (Auto Layout, Components, Variables)',
      'Experiência prévia na criação ou evolução de Design Systems',
      'Conhecimento profundo de diretrizes de acessibilidade (WCAG)'
    ]
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    department: 'Infraestrutura',
    location: 'São Paulo, SP',
    type: 'Remoto',
    description: 'Estamos escalando nossa operação e precisamos de um DevOps Engineer para garantir que nossa infraestrutura suporte esse crescimento. Você focará na automação de infraestrutura (IaC), melhoria dos pipelines de CI/CD e na implementação de práticas de SRE e Observabilidade. O objetivo é reduzir o toil, melhorar o MTTR e garantir 99.9% de disponibilidade. Ambiente 100% Cloud Native.',
    requirements: [
      'Experiência sólida com AWS (EC2, ECS/EKS, RDS, VPC)',
      'Domínio de orquestração de containers com Kubernetes',
      'Infraestrutura como código usando Terraform ou CloudFormation',
      'Experiência com ferramentas de monitoramento (Prometheus, Grafana, Datadog)'
    ]
  },
  {
    id: '6',
    title: 'Executivo de Vendas B2B (Closer)',
    department: 'Vendas',
    location: 'São Paulo, SP',
    type: 'Híbrido',
    description: 'Você tem perfil Hunter e adora fechar negócios? Estamos expandindo nosso time comercial Enterprise. Sua missão será conduzir leads qualificados através do funil de vendas, realizar demonstrações de alto impacto, negociar contratos complexos e fechar parcerias estratégicas. Procuramos profissionais resilientes, com abordagem consultiva (Spin Selling/Challenger Sale) e fome de bater metas agressivas.',
    requirements: [
      'Experiência comprovada com vendas consultivas de software/SaaS (Ticket médio alto)',
      'Histórico consistente de superação de metas (Track Record)',
      'Excelente oratória, negociação e capacidade de contornar objeções',
      'Domínio de CRM (Salesforce, Pipedrive ou Hubspot)'
    ]
  },
  {
    id: '7',
    title: 'Gerente de RH (Business Partner)',
    department: 'Recursos Humanos',
    location: 'Curitiba, PR',
    type: 'Presencial',
    description: 'Atue como o braço direito das lideranças executivas, conectando a estratégia de negócios às pessoas. Como HRBP, você será responsável por desenhar e implementar programas de desenvolvimento de liderança, gestão de performance (Avaliação de Desempenho/PDI) e sucessão. Além disso, atuará na mediação de conflitos e na manutenção da nossa cultura organizacional durante nosso período de hipercrescimento.',
    requirements: [
      'Experiência generalista em RH com atuação consultiva (BP)',
      'Vivência anterior em empresas de tecnologia ou startups em crescimento',
      'Conhecimento sólido em legislação trabalhista e relações sindicais',
      'Forte inteligência emocional e capacidade de influenciar stakeholders'
    ]
  },
  {
    id: '8',
    title: 'Analista Financeiro Pleno',
    department: 'Financeiro',
    location: 'São Paulo, SP',
    type: 'Híbrido',
    description: 'Estamos estruturando nossa área de FP&A e buscamos um analista para liderar o controle orçamentário e a modelagem financeira. Você preparará relatórios gerenciais mensais para a diretoria e investidores, analisando variações entre orçado x realizado (Budget vs Actual). É uma oportunidade incrível para quem gosta de construir processos e ter visibilidade junto ao C-Level.',
    requirements: [
      'Formação superior em Economia, Administração, Engenharia ou Contabilidade',
      'Excel Avançado é mandatório (VBA/Macros); Power BI é um diferencial',
      'Experiência prévia com FP&A, Controladoria ou Planejamento Financeiro',
      'Inglês intermediário/avançado'
    ]
  }
];