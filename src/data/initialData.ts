import { 
  Session, 
  Speaker, 
  TicketTier, 
  Attendee, 
  QAQuestion, 
  SessionPoll, 
  CFPProposal,
  Conference,
  TourismItem,
  AppNotification,
  AuditLogEntry,
  DirectMessage,
  SystemSettings,
  User
} from '../types';

export const TICKET_TIERS: TicketTier[] = [
  {
    id: 'general',
    name: 'General All-Access Pass',
    price: 0,
    description: 'Free access to conference keynotes, breakouts, and live virtual sessions.',
    features: [
      'Access to 3 days of main sessions',
      'Live virtual session rooms',
      'Exhibition hall & networking lounges',
      'Digital attendee badge & mobile pass',
      'Session recordings & materials'
    ],
    badgeColor: 'bg-blue-600'
  },
  {
    id: 'vip',
    name: 'VIP All-Access Pass',
    price: 0,
    description: 'VIP experience with front-row seating, speaker lounge, and priority live-session access.',
    popular: true,
    features: [
      'Everything in General Access Pass',
      'Reserved front-row seating at keynotes',
      'VIP speaker lounge access',
      'Interactive speaker Q&A & mentorship',
      'Digital badge & pass verification'
    ],
    badgeColor: 'bg-amber-500'
  },
  {
    id: 'workshop',
    name: 'Workshop & Lab Access Pass',
    price: 0,
    description: 'Includes full conference access plus hands-on technical workshop rooms.',
    features: [
      'Everything in General Access Pass',
      'Hands-on Live Lab Access',
      'Dedicated Tech Mentor in Live Rooms',
      'Certificate of Completion for Labs',
      'Exclusive Code Repositories & Resources'
    ],
    badgeColor: 'bg-purple-600'
  },
  {
    id: 'virtual',
    name: 'Virtual Global Pass',
    price: 0,
    description: 'Stream live keynotes and join interactive sessions remotely.',
    features: [
      'Live streaming of keynotes and sessions',
      'Interactive live Q&A, polls, and chat',
      'Digital networking lounge',
      'On-demand video replays'
    ],
    badgeColor: 'bg-emerald-600'
  }
];

export const INITIAL_SPEAKERS: Speaker[] = [
  {
    id: 'spk-1',
    name: 'Dr. Elena Rostova',
    role: 'Chief AI Architect',
    company: 'NeuralCorp Global',
    bio: 'Pioneer in multimodal AI agents and large model reasoning systems with over 15 years in AI research. Former Lead Researcher at MIT AI Lab.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    email: 'elena.rostova@neuralcorp.io',
    location: 'San Francisco, CA',
    socials: {
      twitter: 'https://x.com/elenarostova',
      linkedin: 'https://linkedin.com/in/elenarostova',
      github: 'https://github.com/erostova'
    },
    topics: ['Multimodal AI', 'LLM Agents', 'Neural Architecture', 'AI Safety'],
    rating: 4.9,
    featuredSessionId: 'ses-1'
  },
  {
    id: 'spk-2',
    name: 'Marcus Vance',
    role: 'VP of Platform Engineering',
    company: 'CloudScale Inc.',
    bio: 'Architect of high-throughput distributed edge systems serving over 10B daily requests. Author of "Building Resilient Cloud Microservices".',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    email: 'marcus.vance@cloudscale.com',
    location: 'Seattle, WA',
    socials: {
      linkedin: 'https://linkedin.com/in/marcusvance',
      github: 'https://github.com/mvance-cloud'
    },
    topics: ['Distributed Systems', 'Edge Computing', 'Kubernetes', 'SRE'],
    rating: 4.85,
    featuredSessionId: 'ses-3'
  },
  {
    id: 'spk-3',
    name: 'Sarah Chen',
    role: 'Head of Product Design',
    company: 'DesignFlow Studio',
    bio: 'Renowned design leader specializing in cognitive accessibility, design systems at scale, and spatial UI paradigms for web and mobile.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    email: 'sarah.chen@designflow.design',
    location: 'New York, NY',
    socials: {
      twitter: 'https://x.com/sarahchen_ui',
      linkedin: 'https://linkedin.com/in/sarahchendesign'
    },
    topics: ['Design Systems', 'Micro-Interactions', 'Accessibility', 'Spatial UI'],
    rating: 4.92,
    featuredSessionId: 'ses-5'
  },
  {
    id: 'spk-4',
    name: 'Devon Thorne',
    role: 'Principal Security Officer',
    company: 'Aegis Cyber Defense',
    bio: 'Ethical hacker and zero-trust security authority. Has advised Fortune 500 tech firms on securing quantum-resistant API infrastructure.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    email: 'devon@aegiscyber.sec',
    location: 'Austin, TX',
    socials: {
      twitter: 'https://x.com/devonthorne_sec',
      github: 'https://github.com/dthorne-sec'
    },
    topics: ['Zero Trust', 'API Security', 'OAuth2/OIDC', 'Threat Modeling'],
    rating: 4.88,
    featuredSessionId: 'ses-4'
  },
  {
    id: 'spk-5',
    name: 'Amara Okafor',
    role: 'Staff Web Standards Engineer',
    company: 'Vortex Web Frameworks',
    bio: 'Core contributor to modern WebAssembly tooling, Server Components, and real-time streaming web protocols.',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
    email: 'amara@vortexweb.dev',
    location: 'London, UK',
    socials: {
      twitter: 'https://x.com/amara_dev',
      linkedin: 'https://linkedin.com/in/amaraokafor',
      github: 'https://github.com/aokafor'
    },
    topics: ['React 19', 'WebAssembly', 'Edge Rendering', 'Web Performance'],
    rating: 4.95,
    featuredSessionId: 'ses-2'
  },
  {
    id: 'spk-6',
    name: 'Kaito Tanaka',
    role: 'Director of AI Systems & Hardware',
    company: 'NextGen Silicon',
    bio: 'Pioneering custom AI acceleration chips and low-latency local inference engines for edge devices.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    email: 'kaito.tanaka@ngsilicon.jp',
    location: 'Tokyo, Japan',
    socials: {
      linkedin: 'https://linkedin.com/in/kaitotanaka'
    },
    topics: ['Local AI', 'Edge Accelerators', 'On-Device LLMs'],
    rating: 4.82,
    featuredSessionId: 'ses-6'
  }
];

export const INITIAL_SESSIONS: Session[] = [
  {
    id: 'ses-1',
    title: 'Opening Keynote: The Next Horizon of Autonomous AI Agents',
    description: 'Explore how multimodal AI agents are evolving from text assistants into autonomous multi-step reasoning engines capable of operating complex enterprise software.',
    day: 1,
    startTime: '09:00 AM',
    endTime: '10:15 AM',
    startMinutes: 540,
    endMinutes: 615,
    track: 'Keynote',
    room: 'Main Grand Ballroom',
    capacity: 500,
    registeredCount: 482,
    speakerIds: ['spk-1'],
    level: 'All Levels',
    tags: ['AI', 'Agents', 'Keynote', 'Future Tech'],
    isFeatured: true,
    slidesUrl: 'https://example.com/slides/keynote-ai.pdf',
    prerequisites: 'None. Open to all registered attendees.'
  },
  {
    id: 'ses-2',
    title: 'Mastering Modern Full-Stack Web Architecture in 2026',
    description: 'A deep dive into server components, edge routing, real-time WebSocket state streaming, and instant optimistic UI patterns.',
    day: 1,
    startTime: '10:30 AM',
    endTime: '11:45 AM',
    startMinutes: 630,
    endMinutes: 705,
    track: 'Web Development',
    room: 'Auditorium A',
    capacity: 250,
    registeredCount: 210,
    speakerIds: ['spk-5'],
    level: 'Intermediate',
    tags: ['WebDev', 'React', 'TypeScript', 'Server Components'],
    slidesUrl: 'https://example.com/slides/fullstack-2026.pdf',
    prerequisites: 'Familiarity with React and Async JavaScript'
  },
  {
    id: 'ses-3',
    title: 'Architecting Zero-Downtime Microservices at Hyperscale',
    description: 'Learn concrete patterns for canary deployments, automated circuit breakers, distributed tracing with OpenTelemetry, and chaos engineering.',
    day: 1,
    startTime: '10:30 AM',
    endTime: '11:45 AM',
    startMinutes: 630,
    endMinutes: 705,
    track: 'Cloud & Architecture',
    room: 'Room 201',
    capacity: 180,
    registeredCount: 175,
    speakerIds: ['spk-2'],
    level: 'Advanced',
    tags: ['Cloud', 'Kubernetes', 'Microservices', 'Resilience'],
    prerequisites: 'Experience with Cloud Infrastructure & Kubernetes'
  },
  {
    id: 'ses-4',
    title: 'Zero-Trust API Hardening & OAuth 2.1 Security Masterclass',
    description: 'Real-world threat vectors targeting API gateways, JWT vulnerabilities, token theft prevention, and strict Content Security Policies.',
    day: 1,
    startTime: '01:30 PM',
    endTime: '02:45 PM',
    startMinutes: 810,
    endMinutes: 885,
    track: 'Cybersecurity',
    room: 'Security Suite B',
    capacity: 150,
    registeredCount: 142,
    speakerIds: ['spk-4'],
    level: 'Intermediate',
    tags: ['Security', 'OAuth', 'APIs', 'Zero Trust'],
    prerequisites: 'Basic knowledge of REST & GraphQL authentication'
  },
  {
    id: 'ses-5',
    title: 'Designing Fluid Micro-Interactions & Accessible Spatial Interfaces',
    description: 'How to craft intuitive motion physics, accessible high-contrast component tokens, and ergonomic UI design systems.',
    day: 1,
    startTime: '03:00 PM',
    endTime: '04:15 PM',
    startMinutes: 900,
    endMinutes: 975,
    track: 'UX & Product Design',
    room: 'Design Lab 102',
    capacity: 120,
    registeredCount: 118,
    speakerIds: ['spk-3'],
    level: 'All Levels',
    tags: ['Design', 'UX', 'Animation', 'Accessibility'],
    prerequisites: 'Interest in UI/UX and web typography'
  },
  {
    id: 'ses-6',
    title: 'On-Device Small Language Models (SLMs) for Edge Applications',
    description: 'Deploying compressed, quantized 1B-3B parameter models locally in WebGPU and mobile runtimes without cloud latency or subscription fees.',
    day: 2,
    startTime: '09:30 AM',
    endTime: '10:45 AM',
    startMinutes: 570,
    endMinutes: 645,
    track: 'AI & Machine Learning',
    room: 'Auditorium A',
    capacity: 250,
    registeredCount: 238,
    speakerIds: ['spk-6', 'spk-1'],
    level: 'Intermediate',
    tags: ['Edge AI', 'WebGPU', 'Quantization', 'SLM'],
    isFeatured: true,
    prerequisites: 'Basic machine learning concepts'
  },
  {
    id: 'ses-7',
    title: 'DevOps Workshop: Continuous Deployment Pipeline Automation',
    description: 'Hands-on lab constructing GitOps workflows, automatic environment provisioning, and security scanning in GitHub Actions.',
    day: 2,
    startTime: '11:00 AM',
    endTime: '12:30 PM',
    startMinutes: 660,
    endMinutes: 750,
    track: 'DevOps & SRE',
    room: 'Workshop Lab 1',
    capacity: 80,
    registeredCount: 78,
    speakerIds: ['spk-2'],
    level: 'Advanced',
    tags: ['DevOps', 'CI/CD', 'GitOps', 'Automation'],
    prerequisites: 'Bring a laptop with Git & Docker installed'
  },
  {
    id: 'ses-8',
    title: 'Keynote Day 2: Building Ethical Tech in an Era of Rapid Acceleration',
    description: 'Panel discussion on balancing engineering speed with privacy, human safety, and environmental energy impacts of massive AI compute.',
    day: 2,
    startTime: '02:00 PM',
    endTime: '03:15 PM',
    startMinutes: 840,
    endMinutes: 915,
    track: 'Keynote',
    room: 'Main Grand Ballroom',
    capacity: 500,
    registeredCount: 440,
    speakerIds: ['spk-1', 'spk-3', 'spk-4'],
    level: 'All Levels',
    tags: ['Keynote', 'Ethics', 'Tech Leadership', 'Sustainability'],
    isFeatured: true
  },
  {
    id: 'ses-9',
    title: 'Real-Time Data Streaming with WebSockets and Event Sourcing',
    description: 'Building multi-user collaborative experiences and real-time state synchronization with low latency and resilient reconnection state.',
    day: 3,
    startTime: '10:00 AM',
    endTime: '11:15 AM',
    startMinutes: 600,
    endMinutes: 675,
    track: 'Web Development',
    room: 'Auditorium A',
    capacity: 220,
    registeredCount: 195,
    speakerIds: ['spk-5'],
    level: 'Intermediate',
    tags: ['WebSockets', 'Realtime', 'Event Sourcing', 'State Management']
  },
  {
    id: 'ses-10',
    title: 'Closing Keynote & SHC Rwanda Innovation Awards',
    description: 'Celebrating breakthrough open-source projects, community leaders, and vision for the future of developer tools.',
    day: 3,
    startTime: '03:30 PM',
    endTime: '04:45 PM',
    startMinutes: 930,
    endMinutes: 1005,
    track: 'Keynote',
    room: 'Main Grand Ballroom',
    capacity: 500,
    registeredCount: 495,
    speakerIds: ['spk-1', 'spk-2', 'spk-3', 'spk-4', 'spk-5', 'spk-6'],
    level: 'All Levels',
    tags: ['Keynote', 'Awards', 'Closing', 'Community']
  }
];

export const INITIAL_ATTENDEES: Attendee[] = [
  {
    id: 'att-101',
    ticketId: 'TC26-94821',
    ticketTier: 'vip',
    fullName: 'David Miller',
    email: 'david.miller@techtech.com',
    company: 'Nexus Software',
    jobTitle: 'Senior Cloud Engineer',
    interests: ['Cloud Architecture', 'DevOps', 'AI & ML'],
    dietaryPreference: 'Vegetarian',
    tshirtSize: 'L',
    isNetworkingOptIn: true,
    isCheckedIn: true,
    registeredAt: '2026-06-12T10:30:00Z',
    qrCodeData: 'TC26-94821-DAVID-MILLER-NEXUS',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Focused on multi-region Kubernetes deployments and automated IaC.'
  },
  {
    id: 'att-102',
    ticketId: 'TC26-12049',
    ticketTier: 'general',
    fullName: 'Jessica Taylor',
    email: 'jessica.t@designhub.io',
    company: 'DesignHub Labs',
    jobTitle: 'Lead UX Specialist',
    interests: ['UX Design', 'Design Systems', 'Micro-Interactions'],
    dietaryPreference: 'Gluten-Free',
    tshirtSize: 'M',
    isNetworkingOptIn: true,
    isCheckedIn: false,
    registeredAt: '2026-06-15T14:20:00Z',
    qrCodeData: 'TC26-12049-JESSICA-TAYLOR-DESIGNHUB',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Passionate about accessible UI components and fluid design systems.'
  },
  {
    id: 'att-103',
    ticketId: 'TC26-38491',
    ticketTier: 'workshop',
    fullName: 'Robert Thorne',
    email: 'rthorne@cyberguard.net',
    company: 'CyberGuard Systems',
    jobTitle: 'Security Researcher',
    interests: ['Cybersecurity', 'OAuth', 'Zero Trust'],
    dietaryPreference: 'None',
    tshirtSize: 'XL',
    isNetworkingOptIn: true,
    isCheckedIn: true,
    registeredAt: '2026-06-18T09:15:00Z',
    qrCodeData: 'TC26-38491-ROBERT-THORNE-CYBERGUARD',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    bio: 'Penetration testing and API threat vectors.'
  }
];

export const INITIAL_QUESTIONS: QAQuestion[] = [
  {
    id: 'qa-1',
    sessionId: 'ses-1',
    authorName: 'Alex Rivera',
    authorCompany: 'DataOps Corp',
    text: 'How do you handle error recovery when an autonomous agent gets stuck in a multi-step loop?',
    upvotes: 42,
    createdAt: '10 mins ago',
    isAnswered: true
  },
  {
    id: 'qa-2',
    sessionId: 'ses-1',
    authorName: 'Maya Lin',
    authorCompany: 'FinTech AI',
    text: 'What are the current latency benchmarks for real-time multimodal model streaming?',
    upvotes: 29,
    createdAt: '5 mins ago',
    isAnswered: false
  },
  {
    id: 'qa-3',
    sessionId: 'ses-2',
    authorName: 'Chris Evans',
    authorCompany: 'WebStudio',
    text: 'Are Server Components replacing state management libraries like Redux completely in high-frequency apps?',
    upvotes: 18,
    createdAt: '2 mins ago',
    isAnswered: false
  }
];

export const INITIAL_POLLS: SessionPoll[] = [
  {
    id: 'poll-1',
    sessionId: 'ses-1',
    question: 'Where is your company currently deploying AI models?',
    isActive: true,
    options: [
      { id: 'opt-1', text: 'Cloud API Endpoints (e.g. Gemini, OpenAI)', votes: 142 },
      { id: 'opt-2', text: 'Self-Hosted GPUs on Cloud VM', votes: 88 },
      { id: 'opt-3', text: 'Edge / On-Device Local Models', votes: 64 },
      { id: 'opt-4', text: 'Evaluating / Not in Production yet', votes: 35 }
    ]
  }
];

export const INITIAL_CFP_PROPOSALS: CFPProposal[] = [
  {
    id: 'cfp-1',
    speakerName: 'Liam O\'Connor',
    speakerEmail: 'liam@rustedge.dev',
    speakerCompany: 'RustEdge Systems',
    speakerBio: 'Systems programmer with 8 years building WebAssembly modules and low-latency network parsers.',
    title: 'High-Performance WebAssembly in Production: Lessons Learned',
    abstract: 'This session explores how we rewritten our core cryptographic image parser in Rust and compiled it to WebAssembly, reducing CPU usage by 65% in production browser sessions.',
    targetTrack: 'Web Development',
    level: 'Intermediate',
    status: 'pending',
    submittedAt: '2026-07-01T11:00:00Z',
    aiAnalysis: {
      clarityScore: 92,
      overallRating: 'Strong Accept',
      strengths: [
        'Clear practical metric-driven case study (65% CPU reduction)',
        'Highly relevant to developer audience looking for WASM optimization',
        'Well-defined technical scope'
      ],
      improvements: [
        'Consider providing a live interactive playground link or GitHub repo preview during the presentation'
      ],
      suggestedTrack: 'Web Development'
    }
  }
];

export const INITIAL_CONFERENCES: Conference[] = [
  {
    id: 'conf-kigali-2026',
    title: 'Rwanda Global Tech & Innovation Summit 2026',
    shortCode: 'RGTIS-26',
    tagline: 'Driving Hybrid Intelligence & Digital Transformation across Africa',
    description: 'The flagship annual smart hybrid conference hosted at the Kigali Convention Centre.',
    startDate: 'October 14, 2026',
    endDate: 'October 16, 2026',
    venueName: 'Kigali Convention Centre (KCC)',
    city: 'Kigali',
    country: 'Rwanda',
    hostOrg: 'SHC Platform Secretariat',
    status: 'published',
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    capacity: 2500,
    registeredCount: 1420,
    isVirtualAllowed: true,
    isHybridAllowed: true,
    hasTourismGuide: true
  },
  {
    id: 'conf-ea-cyber-2026',
    title: 'East Africa Cyber Security & WebRTC Expo',
    shortCode: 'EACSE-26',
    tagline: 'Securing Real-Time Video & Enterprise Cloud Networks',
    description: 'A regional hybrid gathering focusing on zero-trust architecture, WebRTC encryption, and resilient infrastructure.',
    startDate: 'November 20, 2026',
    endDate: 'November 22, 2026',
    venueName: 'Radisson Blu Hotel & Convention Centre',
    city: 'Kigali',
    country: 'Rwanda',
    hostOrg: 'SHC Platform Secretariat',
    status: 'published',
    bannerImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    logoImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=200&q=80',
    capacity: 1200,
    registeredCount: 840,
    isVirtualAllowed: true,
    isHybridAllowed: true,
    hasTourismGuide: true
  }
];

export const INITIAL_TOURISM: TourismItem[] = [
  {
    id: 'tour-1',
    title: 'Volcanoes National Park (Gorilla Trekking)',
    category: 'attraction',
    description: 'Home to the endangered mountain gorillas and golden monkeys. Experience a world-renowned eco-tourism trekking adventure in the Virunga Massif.',
    location: 'Musanze, Northern Province, Rwanda',
    distanceFromVenue: '105 km from Kigali Convention Centre (2 hr drive)',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    contactNumber: '+250 788 123 456',
    website: 'https://www.visitrwanda.com/destinations/volcanoes-national-park',
    priceRange: 'Guided Permits Available',
    highlights: ['Mountain Gorilla Families', 'Golden Monkey Trekking', 'Bisoroke Volcano Hike', 'Eco-Luxury Lodges']
  },
  {
    id: 'tour-2',
    title: 'Akagera National Park Safari',
    category: 'attraction',
    description: 'Rwanda\'s premier Big Five savanna safari experience featuring lions, leopards, elephants, rhinos, and hippos along Lake Ihema.',
    location: 'Kayonza, Eastern Province, Rwanda',
    distanceFromVenue: '110 km from Kigali Convention Centre',
    image: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    contactNumber: '+250 788 654 321',
    website: 'https://www.visitrwanda.com/destinations/akagera-national-park',
    priceRange: 'Park Fee Applies',
    highlights: ['Big Five Game Drives', 'Lake Ihema Boat Safaris', 'Bird Watching (500+ species)', 'Night Safaris']
  },
  {
    id: 'tour-3',
    title: 'Kigali Genocide Memorial & Museum',
    category: 'attraction',
    description: 'A deeply moving and educational place of remembrance, learning, and peace building in the heart of Kigali.',
    location: 'KG 14 Ave, Gisozi, Kigali',
    distanceFromVenue: '4.5 km from Kigali Convention Centre',
    image: 'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    contactNumber: '+250 252 581 300',
    website: 'https://kgm.rw',
    priceRange: 'Free Admission (Donations Welcome)',
    highlights: ['Guided Audio Tours', 'Peace Education Gardens', 'Exhibition Galleries', 'On-site Cafe']
  },
  {
    id: 'tour-4',
    title: 'Kigali Serena Hotel & Spa',
    category: 'hotel',
    description: 'Luxury 5-star hotel located in Central Kigali with executive suites, swimming pools, international dining, and wellness spa.',
    location: 'KN 3 Ave, Kigali',
    distanceFromVenue: '3.2 km from Kigali Convention Centre',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    contactNumber: '+250 788 184 000',
    website: 'https://www.serenahotels.com/kigali',
    priceRange: '$$$$ (Luxury 5-Star)',
    highlights: ['Outdoor Pool', 'Maisha Health Club & Spa', 'Milima Restaurant', 'Delegate Airport Transfers']
  },
  {
    id: 'tour-5',
    title: 'Radisson Blu Hotel & Convention Centre',
    category: 'hotel',
    description: 'Directly adjoining the Kigali Convention Centre, featuring state-of-the-art conference facilities and high-speed amenities.',
    location: 'KG 2 Roundabout, Kimihurura, Kigali',
    distanceFromVenue: '0.1 km (Adjoining Venue)',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    contactNumber: '+250 252 254 000',
    website: 'https://www.radissonhotels.com',
    priceRange: '$$$$ (Official Conference Hotel)',
    highlights: ['Direct Indoor Access to KCC', 'Filini Italian Restaurant', 'Piazza Outdoor Lounge', 'Full Business Hub']
  },
  {
    id: 'tour-6',
    title: 'Heaven Restaurant & Boutique Lounge',
    category: 'restaurant',
    description: 'Renowned organic dining experience blending Rwandan traditional flavors with international fine cuisine.',
    location: '7 KN 29 St, Kiyovu, Kigali',
    distanceFromVenue: '3.8 km from Kigali Convention Centre',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    contactNumber: '+250 788 892 929',
    website: 'https://www.heavenrwanda.com',
    priceRange: '$$$',
    highlights: ['Farm-to-Table Rwandan Menu', 'Craft Cocktails & Local Coffee', 'Sunset Deck Views', 'Live Cultural Acoustic Nights']
  },
  {
    id: 'tour-7',
    title: 'Yego Cab & Transit Guide Kigali',
    category: 'transport',
    description: 'Official cashless metered taxi and shuttle transportation app operating across Kigali and convention venues.',
    location: 'Kigali Wide / Airport Services',
    distanceFromVenue: 'Covers all Convention Hubs',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    contactNumber: '+250 9191 (Toll Free Dial)',
    priceRange: 'Standard Metered Rates',
    highlights: ['Toll-Free 9191 Dispatch', 'Credit Card & Mobile Money Acceptance', 'Airport Direct Shuttles']
  },
  {
    id: 'tour-8',
    title: 'Rwanda Tourism & Convention Emergency Helpline',
    category: 'emergency',
    description: '24/7 dedicated support desk for international conference delegates, medical emergencies, and lost badge assistance.',
    location: 'SHC Information Desk',
    distanceFromVenue: 'On-Site Information Desk (Hall A)',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    contactNumber: '112 (Emergency Police) / +250 788 313 131',
    priceRange: 'Free Delegate Assistance',
    highlights: ['24/7 Medical & Security Line', 'Lost Badge Emergency Re-issuance', 'VIP Travel Advisory']
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Welcome to SHC Platform!',
    message: 'Your registration is confirmed for the Rwanda Global Tech & Innovation Summit 2026. Your QR pass is ready.',
    timestamp: '10 mins ago',
    type: 'info',
    read: false,
    linkTab: 'registration'
  },
  {
    id: 'notif-2',
    title: 'Live sessions are open',
    message: 'Virtual rooms are now active for keynote and track sessions.',
    timestamp: '25 mins ago',
    type: 'alert',
    read: false,
    linkTab: 'schedule'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-1',
    action: 'Attendee Check-In Verified',
    actor: 'QR Scanner Station #1',
    target: 'Dr. Sarah Jenkins (Attendee)',
    timestamp: '2026-07-21 16:45:10',
    category: 'checkin',
    details: 'Ticket #SHC-2026-9021 verified at Main Entrance Hall A'
  },
  {
    id: 'audit-2',
    action: 'LiveKit Room Token Issued',
    actor: 'LiveKit Gateway Service',
    target: 'Room shc-session-ses-1',
    timestamp: '2026-07-21 17:10:02',
    category: 'session',
    details: 'Generated live-session access token for presenter role'
  }
];

export const INITIAL_DIRECT_MESSAGES: DirectMessage[] = [
  {
    id: 'msg-1',
    senderId: 'att-1',
    senderName: 'Dr. Sarah Jenkins',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    receiverId: 'user-self',
    text: 'Hello! I noticed you are interested in WebRTC and AI infrastructure. Would love to catch up in the networking lounge!',
    timestamp: '10:30 AM'
  }
];

export const INITIAL_SYSTEM_SETTINGS: SystemSettings = {
  autoApproveRegistration: true,
  livekitServerUrl: process.env.LIVEKIT_URL || '',
  smtpConfigured: true,
  emergencyHotline: '+250 788 313 131',
  allowPublicCFP: true,
  defaultTimezone: 'CAT (Central Africa Time / Kigali GMT+2)'
};

export const INITIAL_USERS: (User & { passwordHash?: string })[] = [
  {
    id: 'user-attendee',
    email: 'attendee@kigali2026.rw',
    fullName: 'Amina Mugisha',
    role: 'attendee',
    company: 'Kigali Innovation Hub',
    jobTitle: 'Senior Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    ticketTier: 'vip',
    ticketId: 'TC26-94821',
    bio: 'Passionate about cloud architecture, AI scaling in Africa, and developer communities.',
    passwordHash: 'password123'
  },
  {
    id: 'user-speaker',
    email: 'speaker@kigali2026.rw',
    fullName: 'Dr. Jean-Paul Habimana',
    role: 'speaker',
    company: 'Carnegie Mellon University Africa',
    jobTitle: 'Associate Professor of Computer Science',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    ticketTier: 'vip',
    ticketId: 'TC26-SPK01',
    assignedSessionIds: ['ses-1', 'ses-4'],
    bio: 'Keynote Speaker on Generative AI and Distributed Systems Infrastructure.',
    passwordHash: 'password123'
  },
  {
    id: 'user-moderator',
    email: 'moderator@kigali2026.rw',
    fullName: 'Claudine Uwase',
    role: 'moderator',
    company: 'Rwanda ICT Chamber',
    jobTitle: 'Technology Session Director',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    ticketTier: 'vip',
    ticketId: 'TC26-MOD01',
    assignedSessionIds: ['ses-1', 'ses-2', 'ses-3'],
    bio: 'Moderating AI & Machine Learning tracks at Kigali Convention Centre.',
    passwordHash: 'password123'
  },
  {
    id: 'user-organizer',
    email: 'organizer@kigali2026.rw',
    fullName: 'Emmanuel Nkurunziza',
    role: 'organizer',
    company: 'Rwanda Tech Council',
    jobTitle: 'Head of National Summits',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    ticketTier: 'vip',
    ticketId: 'RCB-ORG-01',
    bio: 'Overseeing multi-conference hybrid events, delegate management, and RCB partnerships.',
    passwordHash: 'password123'
  },
  {
    id: 'user-admin',
    email: 'admin@kigali2026.rw',
    fullName: 'Grace Ingabire',
    role: 'administrator',
    company: 'Ministry of ICT & Innovation',
    jobTitle: 'Platform Administrator',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    ticketTier: 'vip',
    ticketId: 'MIN-ADM-01',
    bio: 'Managing platform credentials, live-session gateways, and system parameters.',
    passwordHash: 'password123'
  },
  {
    id: 'user-superadmin',
    email: 'superadmin@kigali2026.rw',
    fullName: 'SHC Super Admin',
    role: 'super_admin',
    company: 'Ministry of ICT & Smart Africa',
    jobTitle: 'Global Systems Director',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    ticketTier: 'vip',
    ticketId: 'SUPER-001',
    bio: 'Full system authorization, tenant isolation, and audit trail master control.',
    passwordHash: 'password123'
  }
];
