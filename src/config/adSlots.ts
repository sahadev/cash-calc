import type { AdFormat } from '../components/AdSlot';

interface SlotConfig {
  slot: string;
  format: AdFormat;
}

/**
 * Ad slot IDs — replace with real AdSense slot IDs after approval.
 * Set VITE_ADSENSE_CLIENT in .env to enable live ads.
 */
const AD_SLOTS = {
  calculatorSidebar: { slot: '1234567890', format: 'rectangle' as AdFormat },
  resultBottom: { slot: '2345678901', format: 'horizontal' as AdFormat },
  articleInline: { slot: '3456789012', format: 'fluid' as AdFormat },
  cityTableBottom: { slot: '4567890123', format: 'horizontal' as AdFormat },
  converterBottom: { slot: '5678901234', format: 'horizontal' as AdFormat },
} satisfies Record<string, SlotConfig>;

export default AD_SLOTS;
