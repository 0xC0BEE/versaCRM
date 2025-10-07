// This file is likely for legacy purposes, as most of the app uses apiClient.ts.
// It re-exports apiClient to satisfy any lingering dependencies.
// FIX: Corrected the import path for apiClient from a file path to a relative module path.
import apiClient from './apiClient';
export default apiClient;