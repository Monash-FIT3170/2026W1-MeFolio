/**
 * @file accounts.test.js
 * @description Integration test for User Schema and Account Creation API.
 * 
 * Verify the 'Architectural Runway' successfully maps UI inputs 
 * to the official database schema while protecting existing teammate data.
 */

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { expect } from 'chai';

if (Meteor.isServer) {
  describe('Account API & Schema Integration', function () {

    it('should store user data matching the official System Architect schema', async function () {
      //  Prevents collisions with existing users in Compass
      const timestamp = Date.now();
      const uniqueEmail = `test-${timestamp}@mefolio.com`; 
      const uniqueUsername = `dev-track-${timestamp}`;
      
      const testAccount = {
        email: uniqueEmail,
        password: 'securePassword123',
        profile: {
          userName: uniqueUsername, 
          fullName: 'Integration Tester'
        }
      };

      // Create the user using the modern Async method
      const userId = await Accounts.createUserAsync(testAccount);
      
      // Retrieve the specific newly created document
      const savedUser = await Meteor.users.findOneAsync(userId);

      // Verify the document exists
      expect(savedUser, "New user should be found in MongoDB").to.exist;

      // Verify email is stored in the standard Meteor array format
      expect(savedUser.emails[0].address).to.equal(uniqueEmail);
      
      // Verify profile fields match the System Architect's requested structure
      expect(savedUser.profile.fullName).to.equal('Integration Tester');
      expect(savedUser.profile.userName).to.equal(uniqueUsername);

      // Verify Security: Password must be hashed (services.password exists)
      expect(savedUser.services.password).to.exist;
      
      // Verify System Data: Timestamp generated
      expect(savedUser.createdAt).to.be.an.instanceOf(Date);
      
      console.log(`Created unique user ${uniqueEmail}`);
    });
  });
}