// This file is likely for legacy purposes, as most of the app uses apiClient.ts.
// It re-exports apiClient to satisfy any lingering dependencies.
// FIX: Changed to default import for apiClient.
import apiClient from './apiClient';
export default apiClient;