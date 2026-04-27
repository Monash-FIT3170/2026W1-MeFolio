/**
 * UI Tests for LoginPage.jsx
 * 
 * Ensures that the LoginPage component renders correctly and handles user interactions as expected.
 * 
 * To run:
 * meteor test --driver-package meteortesting:mocha --full-app
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect } from 'chai';
import { Meteor } from 'meteor/meteor';
import { LoginPage } from './LoginPage.jsx';

if (Meteor.isClient) {
  describe('LoginPage Component', () => {
    beforeEach(() => {
      // Mock Meteor.loginWithPassword
      Meteor.loginWithPassword = (email, password, callback) => {
        callback(null);
      };
    });

    afterEach(() => {
      delete Meteor.loginWithPassword;
    });

    it('Shows the MeFolio Name', () => {
      render(<LoginPage onSignIn={() => {}} onSwitchToSignUp={() => {}} />);
      const logos = screen.getAllByText('MeFolio');
      expect(logos.length).to.be.greaterThan(0);
    });

    it('Shows the Welcome Back message', () => {
      render(<LoginPage onSignIn={() => {}} onSwitchToSignUp={() => {}} />);
      expect(screen.getByText('Welcome back')).to.exist;
    });

    it('Renders the email input field', () => {
      render(<LoginPage onSignIn={() => {}} onSwitchToSignUp={() => {}} />);
      expect(screen.getByLabelText('Email address')).to.exist;
    });

    it('Renders the password input field', () => {
      render(<LoginPage onSignIn={() => {}} onSwitchToSignUp={() => {}} />);
      expect(screen.getByLabelText('Password')).to.exist;
    });

    it('Renders a link to create a new account', () => {
      render(<LoginPage onSignIn={() => {}} onSwitchToSignUp={() => {}} />);
      expect(screen.getByRole('button', { name: /create an account/i })).to.exist;
    });

    it('renders the Forgot button', () => {
      render(<LoginPage onSignIn={() => {}} onSwitchToSignUp={() => {}} />);
      expect(screen.getByText('Forgot?')).to.exist;
    });

    it('renders GitHub and Google sign-in options', () => {
      render(<LoginPage onSignIn={() => {}} onSwitchToSignUp={() => {}} />);
      expect(screen.getByText('GitHub')).to.exist;
      expect(screen.getByText('Google')).to.exist;
    });
  });
}