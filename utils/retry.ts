export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Tentativa ${attempt} de ${maxRetries}`);
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.error(`Tentativa ${attempt} falhou:`, error);

      if (attempt < maxRetries) {
        console.log(`Aguardando ${delayMs}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // Backoff exponencial
      }
    }
  }

  throw new Error(`Falha após ${maxRetries} tentativas. Último erro: ${lastError?.message}`);
}
