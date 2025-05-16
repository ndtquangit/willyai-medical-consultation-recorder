const serverEnv = {
    DATABASE_URL: process.env.DATABASE_URL,
  };
  
  const clientEnv = {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_DESC: process.env.NEXT_PUBLIC_APP_DESC,
  };

  // Runtime validation
  for (const [key, value] of Object.entries(serverEnv)) {
    if (!value) throw new Error(`Missing environment variable: ${key}`);
  }
  
  export const env = {
    ...serverEnv,
    ...clientEnv,
  };
