import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from '@baseApi/shared/filter';
import * as bcrypt from 'bcrypt';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let api;

  let jwtToken: string;
  let rtToken: string;

  let newJwtToken: string;
  let newRtToken: string;

  let id: string;
  const username = 'cristian.amaral';
  const password = 'teste_12';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
    api = app.getHttpServer();
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(HttpStatus.OK)
      .expect('Hello World!');
  });

  describe('Authentication', () => {
    describe('AuthModule', () => {
      it('authenticates user with valid credentials and provides a jwt token', async () => {
        const res = await request(api)
          .post('/auth/login')
          .send({ username, password })
          .expect(HttpStatus.CREATED);

        expect(res.body.username).toEqual(username);
        expect(res.body.password).toBeUndefined();

        expect(res.body.id).toBeDefined();
        expect(res.body.username).toBeDefined();
        expect(res.body.token.access_token).toBeDefined();
        expect(res.body.token.refresh_token).toBeDefined();

        id = res.body.id;
        jwtToken = res.body.token.access_token;
        rtToken = res.body.token.refresh_token;

        expect(jwtToken).toMatch(
          /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
        ); // jwt regex
        expect(rtToken).toMatch(
          /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
        ); // jwt regex
      });

      it('fails to authenticate user with an incorrect password', async () => {
        const response = await request(api)
          .post('/auth/login')
          .send({ username, password: 'wrong' })
          .expect(HttpStatus.UNAUTHORIZED);

        expect(response.body.token).toBeUndefined();
      });

      it('fails to authenticate user that does not exist', async () => {
        const response = await request(api)
          .post('/auth/login')
          .send({ username: 'nobody@example.com', password })
          .expect(HttpStatus.UNAUTHORIZED);

        expect(response.body.token).not.toBeDefined();
      });
    });

    describe('Get Users', () => {
      it('should return forbidden on missing token', () => {
        return request(api).get('/user').expect(HttpStatus.UNAUTHORIZED);
      });

      it('gets protected resource with jwt authenticated request', async () => {
        const resp = await request(api)
          .get(`/user/${username}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(HttpStatus.OK);

        expect(resp.body._id).toBeDefined();
        expect(resp.body._id).not.toBeNull();
        expect(resp.body.password).not.toBeDefined();
        expect(resp.body.username).toEqual(username.trim().toLocaleLowerCase());
        expect(resp.body.name).toBeDefined();
        expect(resp.body.createdAt).toBeDefined();
        expect(resp.body.updatedAt).toBeDefined();

        const resValidToken = bcrypt.compare(resp.body.hashedRt, rtToken);
        expect(resValidToken).toBeTruthy();
      });
    });
  });

  describe('AuthMode - Refresh Token', () => {
    it('Authenticates with valid refresh token', async () => {
      const resNew = await request(api)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${rtToken}`)
        .expect(HttpStatus.OK);

      expect(resNew.body.username).toEqual(username);
      expect(resNew.body.password).toBeUndefined();
      expect(resNew.body.token.access_token).toBeDefined();
      expect(resNew.body.token.refresh_token).toBeDefined();

      newJwtToken = resNew.body.token.access_token;
      newRtToken = resNew.body.token.refresh_token;

      // console.log('jwtToken:', jwtToken);
      // console.log('newJwtToken:', newJwtToken);

      // console.log('rtToken:', rtToken);
      // console.log('newRtToken:', newRtToken);

      expect(newJwtToken).not.toEqual(jwtToken);
      expect(newRtToken).not.toEqual(rtToken);

      expect(newJwtToken).toMatch(
        /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
      ); // jwt regex
      expect(newRtToken).toMatch(
        /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
      ); // jwt regex
    });

    it('fails to authenticate refresh token with old token', async () => {
      const response = await request(api)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${rtToken}`)
        .expect(HttpStatus.FORBIDDEN);

      expect(response.body.token).not.toBeDefined();
    });

    it('fails to authenticate refresh token with fail token', async () => {
      const response = await request(api)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${rtToken}x`)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.token).not.toBeDefined();
    });

    it('gets protected resource with jwt authenticated new after refresh token', async () => {
      const resp = await request(api)
        .get(`/user/${username}`)
        .set('Authorization', `Bearer ${newJwtToken}`)
        .expect(HttpStatus.OK);

      expect(resp.body._id).toBeDefined();
      expect(resp.body._id).not.toBeNull();
      expect(resp.body.password).not.toBeDefined();
      expect(resp.body.username).toEqual(username.trim().toLocaleLowerCase());
      expect(resp.body.name).toBeDefined();
      expect(resp.body.createdAt).toBeDefined();
      expect(resp.body.updatedAt).toBeDefined();

      const resValidToken = bcrypt.compare(resp.body.hashedRt, newRtToken);
      expect(resValidToken).toBeTruthy();
    });
  });

  describe('Auth  - Logout', () => {
    it('Logout refresh token - Different UserName', async () => {
      await request(api)
        .post('/auth/logout')
        .send({ id: 'xxxxxxxx' })
        .expect(HttpStatus.OK);
    });

    it('gets protected resource with jwt authenticated new after refresh token - but logout a different username', async () => {
      const resp = await request(api)
        .get(`/user/${username}`)
        .set('Authorization', `Bearer ${newJwtToken}`)
        .expect(HttpStatus.OK);

      expect(resp.body._id).toBeDefined();
      expect(resp.body._id).not.toBeNull();
      expect(resp.body.password).not.toBeDefined();
      expect(resp.body.username).toEqual(username.trim().toLocaleLowerCase());
      expect(resp.body.name).toBeDefined();
      expect(resp.body.createdAt).toBeDefined();
      expect(resp.body.updatedAt).toBeDefined();

      const resValidToken = bcrypt.compare(resp.body.hashedRt, newRtToken);
      expect(resValidToken).toBeTruthy();
    });

    it('Logout refresh token valid UserName', async () => {
      await request(api)
        .post('/auth/logout')
        .send({ id: id })
        .expect(HttpStatus.OK);
    });

    it('gets protected resource with jwt authenticated new after refresh token - need clear RtToken', async () => {
      const respLogout = await request(api)
        .get(`/user/${username}`)
        .set('Authorization', `Bearer ${newJwtToken}`)
        .expect(HttpStatus.OK);

      expect(respLogout.body._id).toBeDefined();
      expect(respLogout.body._id).not.toBeNull();
      expect(respLogout.body.password).not.toBeDefined();
      expect(respLogout.body.username).toEqual(
        username.trim().toLocaleLowerCase(),
      );
      expect(respLogout.body.name).toBeDefined();
      expect(respLogout.body.createdAt).toBeDefined();
      expect(respLogout.body.updatedAt).toBeDefined();

      expect(respLogout.body.hashedRt).toEqual(null);
    });
  });
});
