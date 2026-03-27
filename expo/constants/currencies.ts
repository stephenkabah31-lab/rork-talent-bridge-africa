export interface Currency {
  code: string;
  symbol: string;
  country: string;
  rate: number;
}

export const AFRICAN_CURRENCIES: Currency[] = [
  { code: 'NGN', symbol: '₦', country: 'Nigeria', rate: 1550 },
  { code: 'GHS', symbol: '₵', country: 'Ghana', rate: 15.5 },
  { code: 'KES', symbol: 'KSh', country: 'Kenya', rate: 130 },
  { code: 'ZAR', symbol: 'R', country: 'South Africa', rate: 18.5 },
  { code: 'EGP', symbol: 'E£', country: 'Egypt', rate: 49 },
  { code: 'TZS', symbol: 'TSh', country: 'Tanzania', rate: 2600 },
  { code: 'UGX', symbol: 'USh', country: 'Uganda', rate: 3700 },
  { code: 'MAD', symbol: 'د.م.', country: 'Morocco', rate: 10 },
  { code: 'ETB', symbol: 'Br', country: 'Ethiopia', rate: 130 },
  { code: 'XOF', symbol: 'CFA', country: 'West African CFA', rate: 600 },
  { code: 'XAF', symbol: 'FCFA', country: 'Central African CFA', rate: 600 },
  { code: 'RWF', symbol: 'RF', country: 'Rwanda', rate: 1350 },
  { code: 'BWP', symbol: 'P', country: 'Botswana', rate: 13.5 },
  { code: 'ZMW', symbol: 'ZK', country: 'Zambia', rate: 27 },
  { code: 'MUR', symbol: '₨', country: 'Mauritius', rate: 45 },
  { code: 'USD', symbol: '$', country: 'United States', rate: 1 },
];

export interface SubscriptionPlan {
  id: string;
  userType: 'professional' | 'recruiter' | 'company';
  name: string;
  priceUSD: number;
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'professional-premium',
    userType: 'professional',
    name: 'Professional Premium',
    priceUSD: 9.99,
    features: [
      'Unlimited job applications',
      'Message recruiters directly',
      'Featured profile visibility',
      'Advanced job search filters',
      'Resume builder & templates',
      'Interview preparation resources',
      'Priority customer support',
      'Career analytics dashboard',
    ],
  },
  {
    id: 'recruiter-premium',
    userType: 'recruiter',
    name: 'Recruiter Premium',
    priceUSD: 29.99,
    features: [
      'Unlimited candidate searches',
      'Message professionals directly',
      'Advanced filtering & matching',
      'Applicant tracking system',
      'Save & organize candidate profiles',
      'Job posting templates',
      'Analytics & reporting',
      'Priority customer support',
    ],
  },
  {
    id: 'company-premium',
    userType: 'company',
    name: 'Company Premium',
    priceUSD: 49.99,
    features: [
      'Unlimited job postings',
      'Direct messaging with candidates',
      'Featured company page',
      'Advanced candidate matching',
      'Team collaboration tools',
      'Multi-user access',
      'Branded recruiting pages',
      'Comprehensive analytics',
      'Dedicated account manager',
      'Priority support',
    ],
  },
];

export function convertPrice(usdPrice: number, currency: Currency): string {
  const convertedPrice = usdPrice * currency.rate;
  
  if (convertedPrice >= 1000) {
    return `${currency.symbol}${Math.round(convertedPrice).toLocaleString()}`;
  }
  
  return `${currency.symbol}${convertedPrice.toFixed(2)}`;
}
