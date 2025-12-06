
import { Job } from './types';

export const BRAZIL_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

export const MOCK_JOBS: Job[] = [
  {
    id: 'custom-1',
    title: 'Tech Lead de Engenharia de Software (Node.js & React)',
    department: 'Engenharia de Produto',
    location: { city: 'Florianópolis', state: 'SC' },
    type: ['Remoto', 'Híbrido'],
    contractType: ['PJ'],
    description: `Estamos buscando um Tech Lead experiente para liderar a evolução da nossa Plataforma B2B Multi-Service. Você será responsável por definir a arquitetura técnica, garantir a escalabilidade do backend e mentorar desenvolvedores plenos e seniores.
    
    O desafio principal é orquestrar a migração de monolitos para microsserviços, garantindo alta disponibilidade e segurança (RBAC/LGPD).`,
    responsibilities: [
      'Liderar tecnicamente o squad de plataforma, definindo padrões de projeto e arquitetura',
      'Arquitetar soluções distribuídas utilizando Node.js (NestJS) e microsserviços',
      'Garantir a qualidade do código através de Code Reviews rigorosos e implementação de testes',
      'Desenhar estratégias de cache (Redis) e processamento assíncrono para alto volume de dados',
      'Mentorar o time em boas práticas de TypeScript, Clean Architecture e SOLID'
    ],
    requirements: [
      '10+ anos de experiência em desenvolvimento de software',
      'Domínio avançado de Node.js (NestJS) e TypeScript',
      'Experiência sólida com React no Frontend',
      'Vivência em arquitetura de microsserviços e sistemas distribuídos',
      'Experiência com bancos relacionais (PostgreSQL) e NoSQL (Redis)',
      'Conhecimento em Cloud (AWS) e Containerização (Docker)'
    ],
    differentials: [
      'Experiência prévia como Arquiteto de Software ou Tech Lead',
      'Conhecimento em Governança de dados (LGPD) e Segurança (JWT, RBAC)',
      'Vivência em ambientes de alto tráfego (B2B)',
      'Contribuições em projetos Open Source'
    ],
    softSkills: [
      'Liderança técnica inspiradora',
      'Capacidade de traduzir requisitos de negócio em soluções técnicas',
      'Comunicação clara com stakeholders não técnicos',
      'Mentalidade ágil e foco em entrega de valor'
    ],
    schedule: 'Horário Flexível - Foco em Entregas'
  },
  {
    id: 'custom-2',
    title: 'Arquiteto de Soluções Backend (High Performance)',
    department: 'Core Platform',
    location: { city: 'São Paulo', state: 'SP' },
    type: ['Remoto'],
    contractType: ['PJ', 'Cooperado'],
    description: `Junte-se ao time responsável pelo "coração" da nossa tecnologia. Buscamos um especialista em Backend que respire performance, escalabilidade e otimização. Se você gosta de tunar queries SQL, configurar Clusters Redis e desenhar arquiteturas resilientes a falhas, essa vaga é sua.`,
    responsibilities: [
      'Otimizar a performance de APIs REST e GraphQL críticas',
      'Implementar e gerenciar filas de processamento assíncrono (Bull/SQS)',
      'Monitorar a saúde da aplicação (APM, Logs) e atuar proativamente em gargalos',
      'Desenvolver workers em Python ou Node.js para processamento massivo de dados',
      'Garantir a segurança da aplicação implementando autenticação e autorização robustas'
    ],
    requirements: [
      'Expertise profunda em Node.js e ecossistema JavaScript/TypeScript',
      'Domínio de PostgreSQL (Indexação, Otimização de Queries, Partitioning)',
      'Experiência avançada com Redis (Caching, Pub/Sub, Cluster)',
      'Vivência com filas e mensageria (RabbitMQ, Kafka ou SQS)',
      'Docker e Kubernetes para orquestração'
    ],
    differentials: [
      'Conhecimento em Python para Scripts/Data Engineering',
      'Experiência com GraphQL em larga escala',
      'Certificações AWS (Solutions Architect)'
    ],
    softSkills: [
      'Perfil analítico e orientado a dados (Data Driven)',
      'Resiliência e capacidade de resolução de problemas complexos sob pressão',
      'Autonomia e autogerenciamento (Trabalho Remoto)'
    ],
    schedule: 'Segunda a Sexta, Horário Comercial'
  },
  {
    id: 'custom-3',
    title: 'Engenheiro de Software Sênior (Full Stack)',
    department: 'Inovação',
    location: { city: 'Curitiba', state: 'PR' },
    type: ['Remoto'],
    contractType: ['CLT', 'PJ'],
    description: `Buscamos um Engenheiro de Software Sênior versátil para atuar no ciclo completo de desenvolvimento de novos produtos. Você trabalhará desde a concepção da interface em React até a estruturação do banco de dados e deploy na nuvem.`,
    responsibilities: [
      'Desenvolver novas features de ponta a ponta (Frontend e Backend)',
      'Implementar interfaces ricas e responsivas com React e Tailwind/Material UI',
      'Criar APIs seguras e documentadas (Swagger/OpenAPI)',
      'Integrar sistemas com APIs de terceiros (Gateways de Pagamento, ERPs)',
      'Participar de rituais ágeis e contribuir para a melhoria contínua do processo'
    ],
    requirements: [
      'Sólida experiência com React (Hooks, Context API, State Management)',
      'Sólida experiência com Node.js/NestJS no Backend',
      'Experiência com CI/CD (GitHub Actions, Jenkins ou similar)',
      'Conhecimento em testes automatizados (Jest, Cypress, React Testing Library)',
      'Inglês Técnico para leitura e escrita'
    ],
    differentials: [
      'Experiência com Next.js',
      'Conhecimento em ferramentas de monitoramento (New Relic, Datadog)',
      'Experiência com metodologias de Design System'
    ],
    softSkills: [
      'Trabalho em equipe e colaboração',
      'Foco na experiência do usuário (UX)',
      'Adaptabilidade a mudanças de escopo'
    ],
    schedule: 'Flexível'
  },
  {
    id: '1',
    title: 'Desenvolvedor(a) Full Stack Sênior – Tech Lead (.NET, Angular)',
    department: 'Engenharia',
    location: { city: 'Joinville', state: 'SC' },
    type: ['Híbrido', 'Presencial'],
    contractType: ['PJ'],
    description: `Estamos em busca de um(a) Desenvolvedor(a) Full Stack Sênior, com perfil Tech Lead, para liderar a construção de soluções robustas, escaláveis e de alta performance. Essa pessoa atuará em todo o ciclo de desenvolvimento de software — do levantamento à entrega.`,
    responsibilities: [
      'Atuar em todas as etapas do ciclo de vida do software: levantamento de requisitos, arquitetura, desenvolvimento, testes, CI/CD e deploy',
      'Projetar e implementar arquiteturas escaláveis e resilientes, utilizando microserviços, APIs REST e GraphQL',
      'Desenvolver interfaces modernas com Angular 12+ e TypeScript',
      'Criar e manter APIs performáticas e seguras com .NET 7 a 9 (C#)',
      'Monitorar e otimizar aplicações em produção (logs, métricas, tracing e APM)',
      'Documentar boas práticas e padrões de arquitetura'
    ],
    requirements: [
      'Angular 12+ / TypeScript: arquitetura modular, RxJS, interceptors',
      'C# / .NET 7–9: APIs REST, Entity Framework Core, LINQ avançado',
      'SQL avançado (PostgreSQL ou SQL Server)',
      'Docker / Docker Compose',
      'CI/CD: automação completa de build, testes e deploy',
      'Git: versionamento semântico, uso de PRs e fluxo GitFlow'
    ],
    differentials: [
      'Experiência com MongoDB ou Redis',
      'Vivência com cloud computing (AWS, Azure ou Google Cloud)',
      'Arquitetura de microserviços',
      'Segurança de aplicações web (OWASP, JWT)'
    ],
    softSkills: [
      'Autodidata, com aprendizado e aplicação rápidos',
      'Proativo, com atitude de dono e foco em resolver',
      'Organizado, atento a versionamento, testes e documentação',
      'Colaborativo, com boa comunicação entre áreas técnicas e de produto'
    ],
    schedule: 'Segunda a sexta-feira, das 8h às 12h e das 13h às 17h48'
  },
  {
    id: '2',
    title: 'Product Manager B2B',
    department: 'Produto',
    location: { city: 'Rio de Janeiro', state: 'RJ' },
    type: ['Híbrido'],
    contractType: ['CLT', 'PJ'],
    description: 'Como Product Manager, você será o "CEO" do produto, liderando a estratégia desde a concepção até o lançamento (End-to-End). Você trabalhará em estreita colaboração com UX Designers e Engenheiros para resolver dores reais dos nossos clientes B2B.',
    responsibilities: [
      'Definir a visão e estratégia do produto',
      'Gerenciar o backlog e priorizar features baseadas em valor',
      'Conduzir processos de Product Discovery',
      'Analisar métricas de uso e engajamento'
    ],
    requirements: [
      '3+ anos de experiência como PM em produtos digitais B2B ou SaaS',
      'Domínio de metodologias ágeis e frameworks de priorização (RICE, WSJF)',
      'Forte capacidade analítica (SQL e análise de métricas de produto)',
      'Experiência com Discovery contínuo e entrevistas com usuários'
    ],
    softSkills: [
      'Excelente comunicação e capacidade de negociação',
      'Liderança por influência',
      'Pensamento analítico orientado a dados'
    ],
    schedule: 'Horário comercial flexível'
  },
  {
    id: '3',
    title: 'Analista de Dados Pleno',
    department: 'Data & Analytics',
    location: { city: 'Belo Horizonte', state: 'MG' },
    type: ['Presencial'],
    contractType: ['CLT'],
    description: 'Junte-se ao nosso time de Data & Analytics para transformar dados brutos em insights estratégicos. Você será responsável por sustentar e evoluir nossos pipelines de dados.',
    requirements: [
      'Domínio de SQL para consultas complexas e otimização',
      'Experiência sólida com Python para manipulação de dados (Pandas/NumPy)',
      'Experiência na construção de dashboards em PowerBI, Tableau ou Looker'
    ],
    responsibilities: [
      'Manter e evoluir pipelines de dados (ETL/ELT)',
      'Criar visualizações de dados para suporte à decisão',
      'Garantir a qualidade e integridade dos dados'
    ]
  },
  {
    id: '4',
    title: 'Executivo de Vendas B2B (Closer)',
    department: 'Vendas',
    location: { city: 'São Paulo', state: 'SP' },
    type: ['Híbrido', 'Presencial'],
    contractType: ['CLT'],
    description: 'Você tem perfil Hunter e adora fechar negócios? Estamos expandindo nosso time comercial Enterprise.',
    requirements: [
      'Experiência comprovada com vendas consultivas de software/SaaS',
      'Histórico consistente de superação de metas (Track Record)',
      'Excelente oratória, negociação e capacidade de contornar objeções',
      'Domínio de CRM (Salesforce, Pipedrive ou Hubspot)'
    ],
    schedule: 'Comercial'
  }
];
