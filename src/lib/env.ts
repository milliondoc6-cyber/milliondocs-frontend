import { z } from "zod";

/**
 * Type-safe, validated environment variables.
 *
 * Why: reading `process.env.X || "fallback"` everywhere fails *silently* when a
 * var is missing or malformed. Validating once here means a bad/missing env
 * throws loudly at startup instead of at a user's click.
 *
 * NOTE: `NEXT_PUBLIC_*` vars are inlined at BUILD time, so they must be
 * referenced statically (not via a dynamic key) for Next.js to replace them.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url().default("http://localhost:8000"),
});

const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    z.flattenError(parsed.error).fieldErrors
  );
  throw new Error("Invalid environment variables. Check your .env file.");
}

export const env = parsed.data;
