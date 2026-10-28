/**
 * Mock Customers Data for Customer & Admin.
 */

export const mockCustomers = [
  {
    id: 'cust-1',
    firstName: 'Alexander',
    lastName: 'Wright',
    email: 'alex.wright@example.com',
    phone: '+1 (555) 234-8901',
    createdAt: '2025-11-12T10:00:00Z',
    ordersCount: 3,
    totalSpent: 894.20,
    status: 'Active',
    defaultAddress: {
      address: '742 Evergreen Terrace',
      city: 'Portland',
      state: 'OR',
      postalCode: '97201',
      country: 'United States',
    },
  },
  {
    id: 'cust-2',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.rostova@example.com',
    phone: '+44 20 7946 0912',
    createdAt: '2026-01-19T14:20:00Z',
    ordersCount: 2,
    totalSpent: 640.00,
    status: 'Active',
    defaultAddress: {
      address: '12 Kensington Gardens',
      city: 'London',
      state: 'Greater London',
      postalCode: 'W8 4PX',
      country: 'United Kingdom',
    },
  },
  {
    id: 'cust-3',
    firstName: 'Marcus',
    lastName: 'Sterling',
    email: 'm.sterling@example.com',
    phone: '+1 (415) 890-1234',
    createdAt: '2026-02-04T16:40:00Z',
    ordersCount: 1,
    totalSpent: 275.00,
    status: 'Active',
    defaultAddress: {
      address: '450 Sutter Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94108',
      country: 'United States',
    },
  },
];
