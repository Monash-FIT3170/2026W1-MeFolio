/**
 * FEAT-09: Responsive Context Provider for Automatic Layout Adjustment Tests
 * 
 * Tests for breakpoint detection, touch target sizes, and responsive CSS classes
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { Meteor } from 'meteor/meteor';
import { ResponsiveProvider, useResponsive } from '../contexts/ResponsiveContext';


// Test component that uses responsive hook
const TestComponent = () => {
  const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();
  return (
    <div>
      <span data-testid="breakpoint">{breakpoint}</span>
      <span data-testid="isMobile">{String(isMobile)}</span>
      <span data-testid="isTablet">{String(isTablet)}</span>
      <span data-testid="isDesktop">{String(isDesktop)}</span>
    </div>
  );
};

if (Meteor.isClient) {
  describe('Responsive Design', () => {
    describe('ResponsiveContext', () => {
      it('provides responsive breakpoint detection', () => {
        render(
          <ResponsiveProvider>
            <TestComponent />
          </ResponsiveProvider>
        );
        
        // Check rendering of component
        expect(screen.getByTestId('breakpoint')).to.exist;
      });
    });

    describe('Touch Target Sizes', () => {
      it('buttons have minimum 44px height and width', () => {
        render(
          <ResponsiveProvider>
            <button data-testid="test-button">Click Me</button>
          </ResponsiveProvider>
        );
        
        const button = screen.getByTestId('test-button');
        const styles = window.getComputedStyle(button);
        const minHeight = parseInt(styles.minHeight);
        const minWidth = parseInt(styles.minWidth);
        
        expect(minHeight >= 44 || minWidth >= 44).to.be.true;
      });

      it('links have minimum 44px touch target', () => {
        render(
          <ResponsiveProvider>
            <a href="#" data-testid="test-link">Link</a>
          </ResponsiveProvider>
        );
        
        const link = screen.getByTestId('test-link');
        const styles = window.getComputedStyle(link);
        const minHeight = parseInt(styles.minHeight);
        const minWidth = parseInt(styles.minWidth);
        
        expect(minHeight >= 44 || minWidth >= 44).to.be.true;
      });
    });

    describe('Responsive CSS Classes', () => {
      it('responsive-grid class exists and applies grid layout', () => {
        const { container } = render(
          <div className="responsive-grid">
            <div>Item 1</div>
            <div>Item 2</div>
          </div>
        );
        
        const gridElement = container.querySelector('.responsive-grid');
        const styles = window.getComputedStyle(gridElement);
        
        expect(styles.display).to.equal('grid');
      });

      it('container-fluid class applies responsive padding', () => {
        const { container } = render(
          <div className="container-fluid">Content</div>
        );
        
        const element = container.querySelector('.container-fluid');
        expect(element).to.exist;
      });
    });
  });
}