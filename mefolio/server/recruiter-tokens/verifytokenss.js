// imports/api/portfolios/server/publications.js
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { RecruiterTokens } from './collection';
import { Portfolios } from './collection';

Meteor.publish('portfolio.recruiterView', function(portfolioId, token) {
  check(portfolioId, String);
  check(token, String);

  // Verify the token exists and is valid for this specific portfolio
  const validToken = RecruiterTokens.findOne({
    portfolioId: portfolioId,
    token: token,
    expiresAt: { $gt: new Date() } // Double check it hasn't expired
  });

  // Return nothing if token is invalid
  if (!validToken) {
    return this.ready(); 
  }

  return [
    Portfolios.find({ name: portfolioId }), // Return the full hidden recruiter portfolio
  ];
});