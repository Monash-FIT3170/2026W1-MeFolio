/**
 * UI Tests for SignUpPage.jsx
 * 
 * Ensures that the SignUpPage component renders correctly and handles user interactions as expected.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect } from 'chai';
import { SignUpPage } from './SignUpPage.jsx';

describe('SignUpPage Component', () => {
  it('Renders T&C and Privacy Policy links', () => {
    render(<SignUpPage onSignUp={() => {}} onSwitchToSignIn={() => {}} />);
    expect(screen.getByText('Terms')).to.exist;
    expect(screen.getByText('Privacy Policy')).to.exist;
  });

  it('Displays an error message when passwords do not match', async () => {
    render(<SignUpPage onSignUp={() => {}} onSwitchToSignIn={() => {}} />);
    
    // Fill form with mismatching passwords
    fireEvent.change(screen.getByPlaceholderText('Create a strong password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'password456' } });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);
    
    // Check for error message
    const errorDiv = await screen.findByText('Passwords do not match!');
    expect(errorDiv).to.exist;
  });
});
