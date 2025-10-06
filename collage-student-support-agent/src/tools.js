import { tool } from '@langchain/core/tools';

export const getOffers = tool(
  () => {
    return JSON.stringify([
      {
        code: 'LAUNCH',
        discount_percentage: 30,
      },
      {
        code: 'FIRST_20',
        discount_percentage: 20,
      },
      {
        code: 'FIRST_10',
        discount_percentage: 40,
      },
      {
        code: 'FESTIVAL_OFFER',
        discount_percentage: 15,
      },
    ]);
  },
  {
    name: 'get_offers_query',
    description: 'Call this tool to get the available discounts and offers.',
  }
);
