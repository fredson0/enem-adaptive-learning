import { ApiError } from "@/lib/api";

export function isLimiteTokensError(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return false;
  }

  if (error.status === 429) {
    return true;
  }

  return /limite di[aá]rio|tokens ia|upgrade do plano/i.test(error.message);
}
