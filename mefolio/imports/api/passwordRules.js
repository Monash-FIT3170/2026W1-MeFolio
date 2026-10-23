const COMMON_PASSWORDS = new Set([
  "123456",
  "12345678",
  "password",
  "qwerty123",
  "password1",
  "11111111",
]);

export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "letter", label: "Contains a letter", test: (p) => /[A-Za-z]/.test(p) },
  { id: "number", label: "Contains a number", test: (p) => /\d/.test(p) },
  {
    id: "common",
    label: "Not a commonly used password",
    test: (p) => !COMMON_PASSWORDS.has(p.toLowerCase()),
  },
];

export const getFailedRules = (password) =>
  PASSWORD_RULES.filter((rule) => !rule.test(password));

export const isPasswordValid = (password) =>
  getFailedRules(password).length === 0;

// 0-4, for the strength bar
export const getPasswordStrength = (password) => {
  if (!password) return 0;
  let score = PASSWORD_RULES.filter((r) => r.test(password)).length - 1;
  if (password.length >= 12) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  score = Math.max(0, Math.min(4, score));
  return isPasswordValid(password) ? score : Math.min(score, 1);
};
