
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
