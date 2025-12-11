'use client';

import { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  FileText,
  Globe,
  Building,
  Users,
  Coins,
  Target,
  Rocket,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Star
} from 'lucide-react';

// ===== DATOS DE LA GUÍA =====
interface GuideSection {
  id: string;
  titleEs: string;
  titleEn: string;
  icon: React.ReactNode;
  contentEs: string;
  contentEn: string;
}

const guideSections: GuideSection[] = [
  {
    id: 'project-short',
    titleEs: 'Descripción Corta (50 palabras)',
    titleEn: 'Short Description (50 words)',
    icon: <FileText className="w-5 h-5" />,
    contentEs: 'CryptoGift Wallets DAO es la primera infraestructura Web3 que transforma NFTs en wallets completamente funcionales mediante ERC-6551, permitiendo a marcas, creadores y DAOs distribuir activos, recompensas y experiencias educativas a usuarios que aún no tienen wallet, con interacciones gasless y onboarding guiado.',
    contentEn: 'CryptoGift Wallets DAO is the first Web3 infrastructure that transforms NFTs into fully functional wallets using ERC-6551, enabling brands, creators, and DAOs to distribute assets, rewards, and educational experiences to users who don\'t even have a traditional wallet yet, with gasless interactions and guided onboarding.'
  },
  {
    id: 'project-medium',
    titleEs: 'Descripción Media (150 palabras)',
    titleEn: 'Medium Description (150 words)',
    icon: <FileText className="w-5 h-5" />,
    contentEs: `CryptoGift Wallets, el producto insignia del ecosistema, es una infraestructura de producción que convierte NFTs en wallets no custodiales completamente funcionales utilizando cuentas vinculadas a tokens ERC-6551 y account abstraction. Este diseño revolucionario permite que marcas, creadores y DAOs distribuyan activos digitales, quests educativas y recompensas a usuarios que posiblemente no tengan una wallet tradicional, mientras la plataforma maneja todas las interacciones gasless y proporciona un onboarding guiado.

El propósito central de CryptoGift Wallets DAO es impulsar, gobernar y escalar esta plataforma principal, coordinando liquidez, incentivos y educación comunitaria para que más organizaciones puedan usar CryptoGift Wallets para incorporar nuevos usuarios a Web3 de manera sostenible y alineada con la misión.

Como resultado, CryptoGift Wallets no es solo una capa educativa sino también un poderoso canal de distribución y activación para la adopción masiva de Web3 en Base.`,
    contentEn: `CryptoGift Wallets, the flagship product of the ecosystem, is a production-ready infrastructure that turns NFTs into fully functional, non-custodial wallets using ERC-6551 token-bound accounts and account abstraction. This revolutionary design allows brands, creators, and DAOs to distribute digital assets, educational quests, and rewards to users who may not even have a traditional wallet yet, while the platform handles all gasless interactions and provides guided onboarding.

The core purpose of CryptoGift Wallets DAO is to bootstrap, govern, and scale this main platform, coordinating liquidity, incentives, and community education so that more organizations can use CryptoGift Wallets to onboard new users into Web3 in a sustainable, mission-aligned way.

As a result, CryptoGift Wallets is not only an education layer but also a powerful distribution and activation rail for large-scale Web3 adoption on Base.`
  },
  {
    id: 'pitch-30s',
    titleEs: 'Pitch de 30 Segundos',
    titleEn: '30-Second Pitch',
    icon: <Rocket className="w-5 h-5" />,
    contentEs: '"CryptoGift Wallets transforma cómo las personas entran al mundo cripto. Usando ERC-6551, convertimos NFTs en wallets reales que cualquiera puede usar sin conocimiento previo. Mientras la industria tiene 3-4% de claim rate en gift cards cripto, nosotros logramos 85.7%. Somos la infraestructura que marcas, DAOs y empresas necesitan para onboardear usuarios a Web3 a escala."',
    contentEn: '"CryptoGift Wallets transforms how people enter the crypto world. Using ERC-6551, we turn NFTs into real wallets that anyone can use without prior knowledge. While the industry has 3-4% claim rate on crypto gift cards, we achieve 85.7%. We are the infrastructure that brands, DAOs, and companies need to onboard users to Web3 at scale."'
  },
  {
    id: 'why-base',
    titleEs: '¿Por qué Base?',
    titleEn: 'Why Base?',
    icon: <Globe className="w-5 h-5" />,
    contentEs: `Base permite nuestra visión a través de:

1. Compatibilidad EVM para Innovación: Soporte completo para ERC-6551 y EIP-712
2. Economía de Gas Viable: $0.10-0.30 por gift creation vs $10+ en mainnet
3. Infraestructura Madura: Vercel optimizations, ThirdWeb SDK, Biconomy ready
4. Ecosistema de Builders: Comunidad activa para partnerships
5. Potencial Coinbase: Futura integración con Coinbase Wallet

Base Mainnet es nuestro ÚNICO target para 2025. No estamos diversificando entre múltiples L2s.`,
    contentEn: `Base enables our vision through:

1. EVM Compatibility for Innovation: Full support for ERC-6551 and EIP-712
2. Viable Gas Economics: $0.10-0.30 per gift creation vs $10+ on mainnet
3. Mature Infrastructure: Vercel optimizations, ThirdWeb SDK, Biconomy ready
4. Builder Ecosystem: Active community for partnerships
5. Coinbase Potential: Future integration with Coinbase Wallet

Base Mainnet is our ONLY target for 2025. We are not hedging across multiple L2s.`
  },
  {
    id: 'value-prop',
    titleEs: 'Propuesta de Valor',
    titleEn: 'Value Proposition',
    icon: <Star className="w-5 h-5" />,
    contentEs: `¿Qué Hace Único a CryptoGift Wallets?

1. Primera Infraestructura NFT-to-Wallet del Mercado
Somos los primeros en implementar ERC-6551 específicamente para gifting cripto con educación integrada.

2. Tasa de Conversión 21x Superior
Mientras la industria promedia 3-4% de claim rate en gift cards cripto, nuestro sistema logra 85.7%.

3. Canal de Distribución B2B Único
Cada gift es simultáneamente onboarding, educación, y activación de usuario.

4. Modelo de Emisión Sostenible
CGC usa emisión basada en milestones: los tokens solo se mintean cuando el DAO crea valor verificable.

5. Infraestructura, No Solo Producto
CryptoGift Wallets es infraestructura que otras organizaciones pueden usar.`,
    contentEn: `What Makes CryptoGift Wallets Unique?

1. First NFT-to-Wallet Infrastructure in the Market
We are the first to implement ERC-6551 specifically for crypto gifting with integrated education.

2. 21x Superior Conversion Rate
While the industry averages 3-4% claim rate on crypto gift cards, our system achieves 85.7%.

3. Unique B2B Distribution Channel
Each gift is simultaneously onboarding, education, and user activation.

4. Sustainable Emission Model
CGC uses milestone-based emission: tokens are only minted when the DAO creates verifiable value.

5. Infrastructure, Not Just Product
CryptoGift Wallets is infrastructure that other organizations can use.`
  },
  {
    id: 'team',
    titleEs: 'Equipo',
    titleEn: 'Team',
    icon: <Users className="w-5 h-5" />,
    contentEs: `Equipo Principal:

Rafael González - Founder & Product/Engineering Lead
- Desarrollo full-stack y smart contracts
- Diseño de producto y arquitectura técnica
- Email: admin@mbxarts.com

Roberto Legrá - Head of Community & Growth / Marketing Advisor
- Estrategia de crecimiento y comunidad

Leodanni Avila - Business Development & Operations / Marketing Advisor
- Desarrollo de negocio y operaciones

Empresa: The Moon in a Box Inc. (Delaware C-Corporation)`,
    contentEn: `Core Team:

Rafael González - Founder & Product/Engineering Lead
- Full-stack development and smart contracts
- Product design and technical architecture
- Email: admin@mbxarts.com

Roberto Legrá - Head of Community & Growth / Marketing Advisor
- Growth and community strategy

Leodanni Avila - Business Development & Operations / Marketing Advisor
- Business development and operations

Company: The Moon in a Box Inc. (Delaware C-Corporation)`
  },
  {
    id: 'traction',
    titleEs: 'Tracción y Métricas',
    titleEn: 'Traction & Metrics',
    icon: <Target className="w-5 h-5" />,
    contentEs: `Estado Actual:
- Fase: Production Ready (Live en Base Mainnet)
- Contratos Desplegados: 5 (Todos verificados en BaseScan)
- Días de Desarrollo: 400+
- Claim Rate (Beta): 85.7% vs 3-4% industria
- Pool de Liquidez: ~$100 USD (Aerodrome WETH/CGC)
- Discord: Activo (21 canales, 10 roles)

Métricas Técnicas:
- Transacciones On-Chain: 717+ (zero failures)
- Error Rate: 0%
- Uptime: 99.9%
- Idiomas Soportados: 2 (ES/EN)`,
    contentEn: `Current Status:
- Stage: Production Ready (Live on Base Mainnet)
- Contracts Deployed: 5 (All verified on BaseScan)
- Development Days: 400+
- Claim Rate (Beta): 85.7% vs 3-4% industry
- Liquidity Pool: ~$100 USD (Aerodrome WETH/CGC)
- Discord: Active (21 channels, 10 roles)

Technical Metrics:
- On-Chain Transactions: 717+ (zero failures)
- Error Rate: 0%
- Uptime: 99.9%
- Languages Supported: 2 (ES/EN)`
  },
  {
    id: 'tokenomics',
    titleEs: 'Tokenomics',
    titleEn: 'Tokenomics',
    icon: <Coins className="w-5 h-5" />,
    contentEs: `Token CGC:
- Nombre: CryptoGift Coin (CGC)
- Red: Base Mainnet (Chain ID: 8453)
- Contrato: 0x5e3a61b550328f3D8C44f60b3e10a49D3d806175
- Supply Circulante: 2,000,000 CGC
- Supply Máximo: 22,000,000 CGC (via milestone-based emission)
- Decimales: 18
- Estándar: ERC-20 with Votes & Permit

Modelo de Emisión: Los tokens CGC SOLO se mintean cuando el DAO crea valor medible a través de milestones verificados. Esto previene dilución arbitraria mientras permite crecimiento sostenible.`,
    contentEn: `CGC Token:
- Name: CryptoGift Coin (CGC)
- Network: Base Mainnet (Chain ID: 8453)
- Contract: 0x5e3a61b550328f3D8C44f60b3e10a49D3d806175
- Circulating Supply: 2,000,000 CGC
- Max Supply: 22,000,000 CGC (via milestone-based emission)
- Decimals: 18
- Standard: ERC-20 with Votes & Permit

Emission Model: CGC tokens are ONLY minted when the DAO creates measurable value through verified milestone completion. This prevents arbitrary dilution while enabling sustainable growth.`
  },
  {
    id: 'use-of-funds',
    titleEs: 'Uso de Fondos',
    titleEn: 'Use of Funds',
    icon: <Building className="w-5 h-5" />,
    contentEs: `Presupuesto Típico: $10,000 - $15,000

Desglose:
- Security & Audits: $2,000-3,000 (Auditoría + scanning automatizado)
- Gas Sponsorship Pool: $3,000-5,000 (Biconomy Paymaster para 200-400 usuarios)
- Go-to-Market: $2,000-3,000 (Product Hunt + contenido + comunidad)
- Infraestructura: $1,500-2,000 (Vercel Pro + APIs + almacenamiento)
- Contingencia: $1,500-2,000 (Costos inesperados)

Milestones:
- M1: Primeros 100 Usuarios ($3,000)
- M2: 1,000 Gifts + Pilot B2B ($5,000)
- M3: Product-Market Fit ($4,000)
- M4: Contribución al Ecosistema ($3,000)`,
    contentEn: `Typical Budget: $10,000 - $15,000

Breakdown:
- Security & Audits: $2,000-3,000 (Audit + automated scanning)
- Gas Sponsorship Pool: $3,000-5,000 (Biconomy Paymaster for 200-400 users)
- Go-to-Market: $2,000-3,000 (Product Hunt + content + community)
- Infrastructure: $1,500-2,000 (Vercel Pro + APIs + storage)
- Contingency: $1,500-2,000 (Unexpected costs)

Milestones:
- M1: First 100 Users ($3,000)
- M2: 1,000 Gifts + B2B Pilot ($5,000)
- M3: Product-Market Fit ($4,000)
- M4: Ecosystem Contribution ($3,000)`
  },
  {
    id: 'contracts',
    titleEs: 'Contratos Desplegados',
    titleEn: 'Deployed Contracts',
    icon: <FileText className="w-5 h-5" />,
    contentEs: `Contratos en Base Mainnet (Chain ID: 8453):

CGC Token: 0x5e3a61b550328f3D8C44f60b3e10a49D3d806175
MasterEIP712Controller: 0x67D9a01A3F7b5D38694Bb78dD39286Db75D7D869
TaskRulesEIP712: 0xdDcfFF04eC6D8148CDdE3dBde42456fB32bcC5bb
MilestoneEscrow: 0x8346CFcaECc90d678d862319449E5a742c03f109
Aragon DAO: 0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31
Aerodrome Pool: 0x3032f62729513ec8a328143f7d5926b5257a43cd

Todos los contratos están verificados en BaseScan.`,
    contentEn: `Contracts on Base Mainnet (Chain ID: 8453):

CGC Token: 0x5e3a61b550328f3D8C44f60b3e10a49D3d806175
MasterEIP712Controller: 0x67D9a01A3F7b5D38694Bb78dD39286Db75D7D869
TaskRulesEIP712: 0xdDcfFF04eC6D8148CDdE3dBde42456fB32bcC5bb
MilestoneEscrow: 0x8346CFcaECc90d678d862319449E5a742c03f109
Aragon DAO: 0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31
Aerodrome Pool: 0x3032f62729513ec8a328143f7d5926b5257a43cd

All contracts are verified on BaseScan.`
  },
  {
    id: 'urls',
    titleEs: 'URLs y Recursos',
    titleEn: 'URLs & Resources',
    icon: <Globe className="w-5 h-5" />,
    contentEs: `URLs Oficiales:

Website: https://mbxarts.com
Documentación: https://mbxarts.com/docs
Whitepaper: https://mbxarts.com/CRYPTOGIFT_WHITEPAPER_v1.2.html
GitHub: https://github.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO
Discord: https://discord.gg/XzmKkrvhHc
Twitter: https://x.com/CryptoGiftDAO

APIs:
Total Supply: https://mbxarts.com/api/token/total-supply
Circulating Supply: https://mbxarts.com/api/token/circulating-supply

Logos:
Logo 200x200: https://raw.githubusercontent.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO/main/public/metadata/cgc-logo-200x200.png
Logo 512x512: https://raw.githubusercontent.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO/main/public/metadata/cgc-logo-512x512.png`,
    contentEn: `Official URLs:

Website: https://mbxarts.com
Documentation: https://mbxarts.com/docs
Whitepaper: https://mbxarts.com/CRYPTOGIFT_WHITEPAPER_v1.2.html
GitHub: https://github.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO
Discord: https://discord.gg/XzmKkrvhHc
Twitter: https://x.com/CryptoGiftDAO

APIs:
Total Supply: https://mbxarts.com/api/token/total-supply
Circulating Supply: https://mbxarts.com/api/token/circulating-supply

Logos:
Logo 200x200: https://raw.githubusercontent.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO/main/public/metadata/cgc-logo-200x200.png
Logo 512x512: https://raw.githubusercontent.com/CryptoGift-Wallets-DAO/CryptoGift-Wallets-DAO/main/public/metadata/cgc-logo-512x512.png`
  },
  {
    id: 'contact',
    titleEs: 'Contacto',
    titleEn: 'Contact',
    icon: <Users className="w-5 h-5" />,
    contentEs: `Contacto Principal: Rafael González
Email: admin@mbxarts.com
Empresa: The Moon in a Box Inc.
Discord: https://discord.gg/XzmKkrvhHc
Twitter: @CryptoGiftDAO

Disponibilidad para Calls: Flexible, coordinar via email`,
    contentEn: `Primary Contact: Rafael González
Email: admin@mbxarts.com
Company: The Moon in a Box Inc.
Discord: https://discord.gg/XzmKkrvhHc
Twitter: @CryptoGiftDAO

Availability for Calls: Flexible, coordinate via email`
  }
];

// ===== TOP 5 GRANTS =====
interface TopGrant {
  id: string;
  name: string;
  amount: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'ready' | 'pending' | 'submitted';
  url: string;
  priority: number;
  descriptionEs: string;
  descriptionEn: string;
}

const topGrants: TopGrant[] = [
  {
    id: 'base-builder',
    name: 'Base Builder Grants',
    amount: '1-5 ETH ($3k-15k)',
    difficulty: 'Medium',
    status: 'ready',
    url: 'https://docs.base.org/get-started/get-funded',
    priority: 5,
    descriptionEs: 'Grants retroactivos para proyectos desplegados en Base. Recompensa código enviado sobre pitches perfectos.',
    descriptionEn: 'Retroactive grants for projects deployed on Base. Rewards shipped code over perfect pitches.'
  },
  {
    id: 'base-weekly',
    name: 'Base Weekly Rewards',
    amount: '2 ETH/semana',
    difficulty: 'Easy',
    status: 'pending',
    url: 'https://www.builderscore.xyz/',
    priority: 5,
    descriptionEs: 'Competencia semanal via Talent Protocol. Solo registrarse y postear updates semanales.',
    descriptionEn: 'Weekly competition via Talent Protocol. Just register and post weekly updates.'
  },
  {
    id: 'optimism-rpgf',
    name: 'Optimism RetroPGF',
    amount: '$10k-500k+',
    difficulty: 'Medium',
    status: 'pending',
    url: 'https://atlas.optimism.io/',
    priority: 4,
    descriptionEs: 'Retroactive Public Goods Funding. Base es parte del Optimism Superchain.',
    descriptionEn: 'Retroactive Public Goods Funding. Base is part of the Optimism Superchain.'
  },
  {
    id: 'gitcoin',
    name: 'Gitcoin Grants',
    amount: '$1k-50k+',
    difficulty: 'Medium',
    status: 'pending',
    url: 'https://grants.gitcoin.co',
    priority: 4,
    descriptionEs: 'Quadratic Funding. Muchas donaciones pequeñas valen más que pocas grandes.',
    descriptionEn: 'Quadratic Funding. Many small donations are worth more than few large ones.'
  },
  {
    id: 'base-batches',
    name: 'Base Batches',
    amount: 'Mentorship + Funding',
    difficulty: 'Hard',
    status: 'pending',
    url: 'https://basebatches.xyz',
    priority: 3,
    descriptionEs: 'Accelerator de 3 fases. Próximo cohort: H2 2025.',
    descriptionEn: '3-phase accelerator. Next cohort: H2 2025.'
  }
];

// ===== COMPONENTE PRINCIPAL =====
export function ApplicationGuide() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showEnglish, setShowEnglish] = useState(false);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header con Download */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              📚 Application Guide
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Toda la información necesaria para solicitudes de grants
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowEnglish(!showEnglish)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showEnglish
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {showEnglish ? '🇬🇧 English' : '🇪🇸 Español'}
            </button>
            <a
              href="/GRANT_APPLICATION_GUIDE.md"
              download="CryptoGift_Grant_Application_Guide.md"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </a>
          </div>
        </div>
      </div>

      {/* Top 5 Grants */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Top 5 Grant Opportunities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topGrants.map((grant) => (
            <div
              key={grant.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100">{grant.name}</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{grant.amount}</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(grant.priority)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {showEnglish ? grant.descriptionEn : grant.descriptionEs}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className={`text-xs px-2 py-1 rounded ${
                  grant.status === 'ready' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                  grant.status === 'submitted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                }`}>
                  {grant.status === 'ready' ? '✅ Ready to Apply' :
                   grant.status === 'submitted' ? '📤 Submitted' :
                   '⏳ Pending'}
                </span>
                <a
                  href={grant.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Application Status */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
          📊 Application Status
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Platform</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Date</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 px-3 font-medium">CoinGecko</td>
                <td className="py-2 px-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded text-xs">⏳ Sent</span></td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">Dec 2025</td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">Waiting response</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 px-3 font-medium">BaseScan</td>
                <td className="py-2 px-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded text-xs">⏳ Sent</span></td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">Dec 2025</td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">Logo verification</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 px-3 font-medium">Base Builder Grants</td>
                <td className="py-2 px-3"><span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded text-xs">📋 Ready</span></td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">-</td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">Ready to apply</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 px-3 font-medium">Base Weekly Rewards</td>
                <td className="py-2 px-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded text-xs">📋 Register</span></td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">-</td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">Register at Talent Protocol</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 px-3 font-medium">Optimism RetroPGF</td>
                <td className="py-2 px-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded text-xs">📋 Create Account</span></td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">-</td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">Create account on Atlas</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sections with Copy Button */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          📝 Application Content (Click to Expand & Copy)
        </h3>
        {guideSections.map((section) => (
          <div
            key={section.id}
            className="glass-card overflow-hidden"
          >
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
                  {section.icon}
                </div>
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {showEnglish ? section.titleEn : section.titleEs}
                </span>
              </div>
              {expandedSections[section.id] ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections[section.id] && (
              <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800">
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg relative">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {showEnglish ? section.contentEn : section.contentEs}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(
                      showEnglish ? section.contentEn : section.contentEs,
                      section.id
                    )}
                    className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-md transition-shadow"
                    title="Copy to clipboard"
                  >
                    {copiedId === section.id ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
