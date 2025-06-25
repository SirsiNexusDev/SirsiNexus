import React from 'react';
import { render, screen } from '@testing-library/react';
import { Breadcrumb } from '../Breadcrumb';

// Mock usePathname
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('Breadcrumb', () => {
  it('renders home link for root path', () => {
    require('next/navigation').usePathname.mockReturnValue('/');

    render(<Breadcrumb />);

    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders correct breadcrumb items for nested path', () => {
    require('next/navigation').usePathname.mockReturnValue('/projects/123/settings');

    render(<Breadcrumb />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('applies active styles to last item', () => {
    require('next/navigation').usePathname.mockReturnValue('/projects/123');

    render(<Breadcrumb />);

    const lastItem = screen.getByText('123');
    expect(lastItem).toHaveClass('text-sm font-medium text-sirsi-500');
  });

  it('renders separator between items', () => {
    require('next/navigation').usePathname.mockReturnValue('/projects/123');

    render(<Breadcrumb />);

    const separators = screen.getAllByTitle('Chevron Right');
    expect(separators).toHaveLength(2);
  });

  it('converts kebab-case to readable text', () => {
    require('next/navigation').usePathname.mockReturnValue('/migration-wizard/plan-step');

    render(<Breadcrumb />);

    expect(screen.getByText('Migration-wizard')).toBeInTheDocument();
    expect(screen.getByText('Plan-step')).toBeInTheDocument();
  });

  it('handles deep nested paths', () => {
    require('next/navigation').usePathname.mockReturnValue('/projects/123/tasks/456/details');

    render(<Breadcrumb />);

    const items = [
      'Home',
      'Projects',
      '123',
      'Tasks',
      '456',
      'Details',
    ];

    items.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('truncates long paths', () => {
    require('next/navigation').usePathname.mockReturnValue('/very/long/path/with/many/segments/that/should/be/truncated');

    render(<Breadcrumb />);

    expect(screen.queryAllByRole('listitem')).toHaveLength(5);
  });

  it('renders icons for known sections', () => {
    require('next/navigation').usePathname.mockReturnValue('/projects/analytics');

    render(<Breadcrumb />);

    const homeIcon = screen.getByTitle('Home');
    expect(homeIcon).toBeInTheDocument();
  });

  it('handles special characters in path segments', () => {
    require('next/navigation').usePathname.mockReturnValue('/projects/@special_name/details');

    render(<Breadcrumb />);

    expect(screen.getByText('@special_name')).toBeInTheDocument();
  });
});
