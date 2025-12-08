import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardPage from '../DashboardPage';
import { apiService } from '../../services/apiService';

jest.mock('../../services/apiService');

describe('DashboardPage', () => {
  beforeEach(() => {
    (apiService as any).getPatients = jest.fn();
  });

  it('renders patient list and supports filters and problem counts', async () => {
    const demo = [
      { id: 'patient-1', first_name: 'John', last_name: 'Doe', date_of_birth: '1975-03-15', gender: 'Male', mrn: 'MRN001', organization_id: 'org-1', site_name: 'Downtown Clinic', status: 'active', contact_email: 'john@example.com' },
      { id: 'patient-2', first_name: 'Sarah', last_name: 'Johnson', date_of_birth: '1982-07-22', gender: 'Female', mrn: 'MRN002', organization_id: 'org-1', site_name: 'Downtown Clinic', status: 'stable', contact_email: 'sarah@example.com' },
    ];

    // server returns aggregated counts in patient.problem_count
    const demoWithCounts = demo.map((p, i) => ({ ...p, problem_count: i === 0 ? 1 : 0, facts_count: i === 0 ? 2 : 0, last_activity: i === 0 ? '2025-10-02T00:00:00Z' : null }));
    (apiService as any).getPatients.mockResolvedValue({ patients: demoWithCounts, total: demoWithCounts.length });

    render(<DashboardPage user={{ full_name: 'Test User' }} onLogout={() => {}} />);

    // wait for load
    await waitFor(() => expect(apiService.getPatients).toHaveBeenCalled());

    // total patients shown in the stats card
    expect(screen.getByText('2')).toBeInTheDocument();

    // problem counts should be visible
    expect(await screen.findByText(/Problems:\s*1/)).toBeInTheDocument();

    // apply status filter 'stable' and expect only Sarah remains
    const statusSelect = screen.getByDisplayValue('All statuses');
    fireEvent.change(statusSelect, { target: { value: 'stable' } });

    await waitFor(() => expect(screen.getByText('Sarah Johnson')).toBeInTheDocument());
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });
});
