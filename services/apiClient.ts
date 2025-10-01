// ===================================================================================
//
//  API CLIENT
//
//  This file is the single, official entry point for all data requests in the
//  application. It abstracts away the data source, which is currently a mock
//  service but will eventually be a real backend API.
//
//  When transitioning to a real backend, this is the ONLY file you will need to
//  modify. Simply replace the calls to `mockApi` with `fetch` requests to your
//  server's endpoints.
//
// ===================================================================================

import mockApi from './api';

// Example of how you would structure this for a real API:
// const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';
//
// const apiClient = {
//   getContacts: (organizationId: string) => {
//     return fetch(`${API_BASE_URL}/organizations/${organizationId}/contacts`)
//       .then(res => res.json());
//   },
//   // ... other real API calls
// };


// For now, we are using the mock service to simulate API calls.
const apiClient = {
    ...mockApi
};

export default apiClient;