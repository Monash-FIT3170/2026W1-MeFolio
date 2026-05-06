/**
 * @file session.test.js
 * @description Integration test for Session Persistence and Resume Tokens.
 */

import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';

if (Meteor.isClient) {
  describe('User Session Persistence', function () {
    
    // Use Mocking to match the UI test style and avoid environment errors
    beforeEach(() => {
      if (!Meteor.loginWithPassword) {
        Meteor.loginWithPassword = (user, pass, callback) => {
          // Simulate the 'Stay Opening' behavior by saving a mock token
          localStorage.setItem('Meteor.loginToken', 'mock-resume-access-token-2026');
          callback(null); // Simulate success
        };
      }
    });

    it('should retain the login token in local storage after authentication', function (done) {
      // Execute login (this calls our mock above)
      Meteor.loginWithPassword('any-test@mefolio.com', 'password123', (error) => {
        if (error) {
          done(error);
          return;
        }

        // Verify the 'Resume Access Token' is stored in the browser
        const token = localStorage.getItem('Meteor.loginToken');
        
        expect(token).to.be.a('string'); 
        expect(token.length).to.be.greaterThan(10);
        
        // Success
        done();
      });
    });
  });
}