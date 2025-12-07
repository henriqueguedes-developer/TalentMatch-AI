
import { Job } from './types';

export const BRAZIL_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Federal District' },
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
    title: 'Software Engineering Tech Lead (Node.js & React)',
    department: 'Product Engineering',
    location: { city: 'Florianópolis', state: 'SC' },
    type: ['Remote', 'Hybrid'],
    contractType: ['Contractor'],
    salaryRange: 'R$ 18.000 - R$ 22.000',
    interviewRequired: true,
    description: `We are looking for an experienced Tech Lead to spearhead the evolution of our B2B Multi-Service Platform. You will be responsible for defining technical architecture, ensuring backend scalability, and mentoring mid/senior developers.
    
    The main challenge is orchestrating the migration from monoliths to microservices, ensuring high availability and security (RBAC/LGPD).`,
    responsibilities: [
      'Technically lead the platform squad, defining design patterns and architecture',
      'Architect distributed solutions using Node.js (NestJS) and microservices',
      'Ensure code quality through rigorous Code Reviews and testing implementation',
      'Design caching strategies (Redis) and asynchronous processing for high data volume',
      'Mentor the team on TypeScript, Clean Architecture, and SOLID best practices'
    ],
    requirements: [
      '10+ years of experience in software development',
      'Advanced mastery of Node.js (NestJS) and TypeScript',
      'Solid experience with React on Frontend',
      'Experience in microservices architecture and distributed systems',
      'Experience with relational databases (PostgreSQL) and NoSQL (Redis)',
      'Knowledge of Cloud (AWS) and Containerization (Docker)'
    ],
    differentials: [
      'Previous experience as Software Architect or Tech Lead',
      'Knowledge in Data Governance (GDPR/LGPD) and Security (JWT, RBAC)',
      'Experience in high-traffic environments (B2B)',
      'Contributions to Open Source projects'
    ],
    softSkills: [
      'Inspiring technical leadership',
      'Ability to translate business requirements into technical solutions',
      'Clear communication with non-technical stakeholders',
      'Agile mindset and focus on value delivery'
    ],
    schedule: 'Flexible Hours - Delivery Focused'
  },
  {
    id: 'custom-2',
    title: 'Backend Solutions Architect (High Performance)',
    department: 'Core Platform',
    location: { city: 'São Paulo', state: 'SP' },
    type: ['Remote'],
    contractType: ['Contractor', 'Freelancer'],
    salaryRange: 'R$ 20.000 - R$ 25.000',
    interviewRequired: true,
    description: `Join the team responsible for the "heart" of our technology. We are looking for a Backend specialist who breathes performance, scalability, and optimization. If you like tuning SQL queries, configuring Redis Clusters, and designing fault-tolerant architectures, this role is for you.`,
    responsibilities: [
      'Optimize performance of critical REST and GraphQL APIs',
      'Implement and manage asynchronous processing queues (Bull/SQS)',
      'Monitor application health (APM, Logs) and act proactively on bottlenecks',
      'Develop workers in Python or Node.js for massive data processing',
      'Ensure application security by implementing robust authentication and authorization'
    ],
    requirements: [
      'Deep expertise in Node.js and JavaScript/TypeScript ecosystem',
      'Mastery of PostgreSQL (Indexing, Query Optimization, Partitioning)',
      'Advanced experience with Redis (Caching, Pub/Sub, Cluster)',
      'Experience with queues and messaging (RabbitMQ, Kafka, or SQS)',
      'Docker and Kubernetes for orchestration'
    ],
    differentials: [
      'Knowledge in Python for Scripts/Data Engineering',
      'Experience with GraphQL at large scale',
      'AWS Certifications (Solutions Architect)'
    ],
    softSkills: [
      'Analytical and Data-Driven profile',
      'Resilience and ability to solve complex problems under pressure',
      'Autonomy and self-management (Remote Work)'
    ],
    schedule: 'Mon-Fri, Business Hours'
  },
  {
    id: 'custom-3',
    title: 'Senior Software Engineer (Full Stack)',
    department: 'Innovation',
    location: { city: 'Curitiba', state: 'PR' },
    type: ['Remote'],
    contractType: ['Full-time', 'Contractor'],
    salaryRange: 'R$ 14.000 - R$ 17.000',
    interviewRequired: false,
    description: `We are seeking a versatile Senior Software Engineer to work on the full development cycle of new products. You will work from interface conception in React to database structuring and cloud deploy.`,
    responsibilities: [
      'Develop new features end-to-end (Frontend and Backend)',
      'Implement rich and responsive interfaces with React and Tailwind/Material UI',
      'Create secure and documented APIs (Swagger/OpenAPI)',
      'Integrate systems with third-party APIs (Payment Gateways, ERPs)',
      'Participate in agile rituals and contribute to continuous process improvement'
    ],
    requirements: [
      'Solid experience with React (Hooks, Context API, State Management)',
      'Solid experience with Node.js/NestJS on Backend',
      'Experience with CI/CD (GitHub Actions, Jenkins or similar)',
      'Knowledge of automated testing (Jest, Cypress, React Testing Library)',
      'Technical English for reading and writing'
    ],
    differentials: [
      'Experience with Next.js',
      'Knowledge of monitoring tools (New Relic, Datadog)',
      'Experience with Design System methodologies'
    ],
    softSkills: [
      'Teamwork and collaboration',
      'Focus on User Experience (UX)',
      'Adaptability to scope changes'
    ],
    schedule: 'Flexible'
  },
  {
    id: '1',
    title: 'Senior Full Stack Developer – Tech Lead (.NET, Angular)',
    department: 'Engineering',
    location: { city: 'Joinville', state: 'SC' },
    type: ['Hybrid', 'On-site'],
    contractType: ['Contractor'],
    salaryRange: 'R$ 16.000',
    interviewRequired: true,
    description: `We are looking for a Senior Full Stack Developer with a Tech Lead profile to lead the construction of robust, scalable, and high-performance solutions. This person will act in the entire software development life cycle — from requirements to delivery.`,
    responsibilities: [
      'Act in all stages of the software life cycle: requirements gathering, architecture, development, testing, CI/CD, and deploy',
      'Design and implement scalable and resilient architectures using microservices, REST APIs, and GraphQL',
      'Develop modern interfaces with Angular 12+ and TypeScript',
      'Create and maintain performant and secure APIs with .NET 7 to 9 (C#)',
      'Monitor and optimize applications in production (logs, metrics, tracing, and APM)',
      'Document best practices and architecture patterns'
    ],
    requirements: [
      'Angular 12+ / TypeScript: modular architecture, RxJS, interceptors',
      'C# / .NET 7–9: REST APIs, Entity Framework Core, advanced LINQ',
      'Advanced SQL (PostgreSQL or SQL Server)',
      'Docker / Docker Compose',
      'CI/CD: full automation of build, testing, and deploy',
      'Git: semantic versioning, use of PRs, and GitFlow'
    ],
    differentials: [
      'Experience with MongoDB or Redis',
      'Experience with cloud computing (AWS, Azure, or Google Cloud)',
      'Microservices architecture',
      'Web application security (OWASP, JWT)'
    ],
    softSkills: [
      'Self-taught, with fast learning and application',
      'Proactive, with ownership attitude and focus on solving',
      'Organized, attentive to versioning, testing, and documentation',
      'Collaborative, with good communication between technical and product areas'
    ],
    schedule: 'Monday to Friday, 8am to 12pm and 1pm to 5:48pm'
  },
  {
    id: '2',
    title: 'B2B Product Manager',
    department: 'Product',
    location: { city: 'Rio de Janeiro', state: 'RJ' },
    type: ['Hybrid'],
    contractType: ['Full-time', 'Contractor'],
    salaryRange: 'R$ 12.000 - R$ 15.000',
    interviewRequired: false,
    description: 'As a Product Manager, you will be the "CEO" of the product, leading the strategy from conception to launch (End-to-End). You will work closely with UX Designers and Engineers to solve real pains of our B2B clients.',
    responsibilities: [
      'Define product vision and strategy',
      'Manage backlog and prioritize features based on value',
      'Conduct Product Discovery processes',
      'Analyze usage and engagement metrics'
    ],
    requirements: [
      '3+ years of experience as PM in B2B digital products or SaaS',
      'Mastery of agile methodologies and prioritization frameworks (RICE, WSJF)',
      'Strong analytical capacity (SQL and product metrics analysis)',
      'Experience with continuous Discovery and user interviews'
    ],
    softSkills: [
      'Excellent communication and negotiation skills',
      'Leadership by influence',
      'Data-driven analytical thinking'
    ],
    schedule: 'Flexible business hours'
  }
];