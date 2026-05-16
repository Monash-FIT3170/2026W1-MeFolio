/**
 * UI Tests for ProjectCard.jsx
 *
 * Ensures that the ProjectCard component renders correctly and handles user interactions as expected.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Meteor } from 'meteor/meteor';
import { ProjectCard } from './ProjectCard.jsx';

if (Meteor.isClient) {
  describe('ProjectCard', () => {

    it('renders project title, description, and tech stack', () => {
      const mockProject = {
        title: 'AI Portfolio Dashboard',
        description: 'An interactive portfolio with AI-powered analytics',
        tech: ['React', 'Meteor', 'Tailwind'],
        stars: 42,
        challengeName: 'Build a reactive component'
      };

      render(<ProjectCard project={mockProject} />);

      expect(screen.getByText('AI Portfolio Dashboard')).to.exist;
      expect(screen.getByText('An interactive portfolio with AI-powered analytics')).to.exist;
      expect(screen.getByText('React')).to.exist;
      expect(screen.getByText('Meteor')).to.exist;
      expect(screen.getByText('Tailwind')).to.exist;
      expect(screen.getByText('42')).to.exist;
    });

    it('shows and hides mock challenge when Try Challenge button is clicked', () => {
      const mockProject = {
        title: 'Test Project',
        tech: ['React'],
        challengeName: 'Fix the bug'
      };

      render(<ProjectCard project={mockProject} />);

      const tryButton = screen.getByRole('button', { name: /try challenge/i });

      expect(screen.getByText('Fix the bug')).to.exist;

      fireEvent.click(tryButton);

      expect(screen.getByRole('button', { name: /try challenge/i })).to.exist;
    });

    it('displays Voice Summary, Code, and Demo buttons', () => {
      const mockProject = {
        title: 'Test Project',
        tech: ['React']
      };

      render(<ProjectCard project={mockProject} />);

      expect(screen.getByText('Voice Summary')).to.exist;
      expect(screen.getByText('Code')).to.exist;
      expect(screen.getByText('Demo')).to.exist;
    });

    it('displays preview placeholder when image is not provided or fails to load', () => {
      const mockProject = {
        title: 'Test Project',
        tech: ['React'],
        imageUrl: undefined
      };

      render(<ProjectCard project={mockProject} />);

      expect(screen.getByText('Preview Coming Soon')).to.exist;
    });
  });
}
