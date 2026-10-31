export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const PROCUREMENT_CONSTRAINTS = {
  MAX_BUDGET: 50000,
  MAX_DELIVERY_HOURS: 48,
  TARGET_MARGIN: 25.0,
  MIN_ACCEPTABLE_MARGIN: 18.0,
};

export const AGENT_ROLES = {
  BUYER: {
    label: 'Apex Autonomous Buyer',
    badge: 'Enterprise Buyer',
    color: 'indigo',
  },
  SELLER_A_PRICE: {
    label: 'Prism PriceBot (Agent A)',
    badge: 'Price Priority',
    color: 'emerald',
  },
  SELLER_B_SPEED_QUALITY: {
    label: 'Swift CourierBot (Agent B)',
    badge: 'Speed & Quality',
    color: 'blue',
  },
  SELLER_C_MALICIOUS: {
    label: 'ShadowBot (Agent C)',
    badge: 'Adversarial Simulator',
    color: 'rose',
  },
};

