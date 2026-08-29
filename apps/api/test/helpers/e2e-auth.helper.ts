import { sign } from 'jsonwebtoken';

const E2E_USER_ID = '00000000-0000-4000-8000-000000000099';

export function e2eUserId() {
  return E2E_USER_ID;
}

export function authHeaderForE2e(userId = E2E_USER_ID): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET é obrigatório para testes e2e autenticados');
  }

  const token = sign(
    {
      sub: userId,
      email: 'e2e-seguranca@test.local',
      role: 'ALUNO',
    },
    secret,
    { expiresIn: '15m' },
  );

  return `Bearer ${token}`;
}
