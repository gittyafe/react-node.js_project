export const shouldSeedDemoData = (env = process.env) => {
  const isProduction = env.NODE_ENV === 'production';
  const explicitSeedFlag = env.SEED_DEMO_DATA === 'true';

  return !isProduction && explicitSeedFlag;
};
