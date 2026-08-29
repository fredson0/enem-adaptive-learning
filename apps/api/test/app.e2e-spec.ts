import request from 'supertest';
import { createE2eApp } from './helpers/e2e-app.helper';
describe('App (e2e)', () => {
  let app: Awaited<ReturnType<typeof createE2eApp>>;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / responde health básico', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('POST /ia-tutor/mensagens exige autenticação', () => {
    return request(app.getHttpServer())
      .post('/ia-tutor/mensagens')
      .send({ mensagem: 'teste' })
      .expect(401);
  });

  it('POST /ia-tutor/mensagens/stream exige autenticação', () => {
    return request(app.getHttpServer())
      .post('/ia-tutor/mensagens/stream')
      .send({ mensagem: 'teste' })
      .expect(401);
  });
});
