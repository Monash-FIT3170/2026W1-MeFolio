import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Meteor } from 'meteor/meteor';
import { ForgotPasswordPage } from './ForgotPasswordPage.jsx';

if (Meteor.isClient) {
    describe('ForgotPasswordPage', () => {
        it('renders the email verification form', () => {
            render(
                <ForgotPasswordPage
                    onBackToLogin={() => {}}
                    onPasswordReset={() => {}}
                />
            );
            
            expect(screen.getByText('Verify Your Identity')).to.exist;
            expect(screen.getByLabelText('Email Address')).to.exist;
            expect(screen.getByRole('button', { name: /verify email/i })).to.exist;
        });

        it('has a back button that can be clicked', () => {
            let clicked = false;
            
            render(
                <ForgotPasswordPage
                    onBackToLogin={() => clicked = true}
                    onPasswordReset={() => {}}
                />
            );

            const backButton = screen.getAllByText('Back to Login')[0];
            fireEvent.click(backButton);
            
            expect(clicked).to.be.true;
        });
    });
}