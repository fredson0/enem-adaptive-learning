import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { authHeaderForE2e } from './helpers/e2e-auth.helper';
import { createE2eApp } from './helpers/e2e-app.helper';

describe('Segurança (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('ParseUUIDPipe — IDs malformados', () => {
    const auth = () => authHeaderForE2e();

    it('GET /simulados/:id rejeita UUID inválido com 400', async () => {
      await request(app.getHttpServer())
        .get('/simulados/nao-e-uuid')
        .set('Authorization', auth())
        .expect(400);
    });

    it('GET /ia-tutor/conversas/:id rejeita UUID inválido com 400', async () => {
      await request(app.getHttpServer())
        .get('/ia-tutor/conversas/1; DROP TABLE conversas_tutor;--')
        .set('Authorization', auth())
        .expect(400);
    });

    it('PATCH /ia-tutor/conversas/:id rejeita UUID inválido com 400', async () => {
      await request(app.getHttpServer())
        .patch('/ia-tutor/conversas/1; DROP TABLE conversas_tutor;--')
        .set('Authorization', auth())
        .send({ titulo: 'teste' })
        .expect(400);
    });

    it('DELETE /ia-tutor/conversas/:id rejeita UUID inválido com 400', async () => {
      await request(app.getHttpServer())
        .delete('/ia-tutor/conversas/abc')
        .set('Authorization', auth())
        .expect(400);
    });
  });

  describe('SQL injection — busca de questões', () => {
    const payloads = [
      "'; DROP TABLE questoes; --",
      "1' OR '1'='1",
      "funções'); DELETE FROM questoes WHERE ('1'='1",
    ];

    it.each(payloads)(
      'GET /questoes/contagem sanitiza termo malicioso: %s',
      async (termoMalicioso) => {
        const response = await request(app.getHttpServer())
          .get('/questoes/contagem')
          .query({ termosBusca: termoMalicioso })
          .set('Authorization', authHeaderForE2e())
          .expect(200);

        expect(response.body).toMatchObject({
          total: expect.any(Number),
        });
        expect(response.body.total).toBeGreaterThanOrEqual(0);
      },
    );

    it('contagem após payloads maliciosos ainda responde (tabela intacta)', async () => {
      const response = await request(app.getHttpServer())
        .get('/questoes/contagem')
        .set('Authorization', authHeaderForE2e())
        .expect(200);

      expect(typeof response.body.total).toBe('number');
    });
  });
});
