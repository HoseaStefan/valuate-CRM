import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist', 'node_modules', 'src/config'],
  },

  ...tseslint.configs.recommended,

  {
    rules: {
      // allow "any" without failing CI
      '@typescript-eslint/no-explicit-any': 'off',

      // allow unused args like (req, res, next)
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];