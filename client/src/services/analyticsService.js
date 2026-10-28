import { mockAnalytics } from '../data/mockAnalytics';

export const analyticsService = {
  getDashboardAnalytics: async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return mockAnalytics;
  },
};

export default analyticsService;
