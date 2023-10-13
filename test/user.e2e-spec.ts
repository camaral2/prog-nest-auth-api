//https://dominicarrojado.com/posts/building-a-link-shortener-api-with-nestjs-and-mongodb-with-tests-part-2/
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { faker } from '@faker-js/faker';
import { HttpExceptionFilter } from '@baseApi/shared/filter';
import { Repository } from 'typeorm';
import { User } from '@baseApi/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpdateUserDto } from '@baseApi/user/dto/update-user.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let api;

  let jwtToken;

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
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('Should validate the payload', async () => {
      await request(api)
        .post('/auth/login')
        .send({})
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return Unauthorised on bad credentials', async () => {
      await request(api)
        .post('/auth/login')
        .send({ username, password: 'incorrect' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should log a user in and return a JWT token', async () => {
      await request(api)
        .post('/auth/login')
        .send({ username, password })
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.username).toEqual(username);
          expect(res.body.password).toBeUndefined();
          expect(res.body.token.access_token).toBeDefined();
          jwtToken = res.body.token.access_token;

          expect(jwtToken).toMatch(
            /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
          ); // jwt regex
        });
    });
  });

  const createUserBody = () => {
    return {
      username: faker.internet.userName(),
      name: faker.name.fullName(),
      password: faker.internet.password(10),
    };
  };
  const createInvalidUserBodies = () => {
    const validUser = createUserBody();

    // prettier-ignore
    return [
      // invalid payload
      undefined,
      {},

      // invalid name
      { username: faker.internet.userName(), password: validUser.password },
      { name: undefined, username: faker.internet.userName(), password: validUser.password },
      { name: null, username: faker.internet.userName(), password: validUser.password },
      { name: faker.datatype.boolean(), username: faker.internet.userName(), password: validUser.password },
      { name: faker.datatype.number(), username: faker.internet.userName(), password: validUser.password },
      { name: JSON.parse(faker.datatype.json()), username: faker.internet.userName(), password: validUser.password },
      { name: '', username: faker.internet.userName(), password: validUser.password },
      //{ name: '<script>true</script>', username: faker.internet.userName(), password: validUser.password },

      // invalid username
      { name: validUser.name, password: validUser.password },
      { username: undefined, name: validUser.name, password: validUser.password },
      { username: null, name: validUser.name, password: validUser.password },
      { username: faker.datatype.boolean(), name: validUser.name, password: validUser.password },
      { username: faker.datatype.number(), name: validUser.name, password: validUser.password },
      { username: JSON.parse(faker.datatype.json()), name: validUser.name, password: validUser.password },
      { username: '', name: validUser.name, password: validUser.password },
      //{ username: faker.word.noun(), name: validUser.name, password: validUser.password },

      // invalid password
      { name: validUser.name, username: faker.internet.userName() },
      { password: undefined, name: validUser.name, username: faker.internet.userName() },
      { password: null, name: validUser.name, username: faker.internet.userName() },
      { password: faker.datatype.boolean(), name: validUser.name, username: faker.internet.userName() },
      { password: faker.datatype.number(), name: validUser.name, username: faker.internet.userName() },
      { password: JSON.parse(faker.datatype.json()), name: validUser.name, username: faker.internet.userName() },
      { password: '', name: validUser.name, username: faker.internet.userName() },
      { password: faker.word.noun(), name: validUser.name, username: faker.internet.userName() },
    ];
  };

  const userValid = createUserBody();

  describe('Insert an user', () => {
    it('/ (POST)', async () => {
      const resp = await request(api)
        .post('/user')
        .send(userValid)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.CREATED);

      expect(resp.body._id).toBeDefined();
      expect(resp.body._id).not.toBeNull();

      expect(resp.body.username).toEqual(
        userValid.username.toLocaleLowerCase(),
      );

      expect(resp.body.name).toEqual(userValid.name);

      expect(resp.body.password).toBeDefined();
      expect(resp.body.password).not.toEqual(userValid.password);

      //expect(resp.body.createdAt).toBeDefined();
      //expect(resp.body.updatedAt).toBeDefined();

      // expect(resBody).toEqual({
      //   ...linkBody,
      //   id: expect.any(String),
      // });
    });

    it('/POST an user duplicate', async () => {
      await request(api)
        .post('/user')
        .send(userValid)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.CONFLICT)
        .expect(/duplicate key/);

      //expect(resBody.message).toBe('Short name already exists');
    });

    describe('Should accept valid data', () => {
      const invalidData = createInvalidUserBodies();

      invalidData.forEach((payload) => {
        const payloadString = JSON.stringify(payload);
        it(`Invalid data (${payloadString})`, async () => {
          const res = await request(api)
            .post('/user')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(payload)
            .expect(HttpStatus.BAD_REQUEST);

          const resBody = res.body;

          expect(resBody.error).toEqual(
            expect.arrayContaining([expect.any(String)]),
          );
        });
      });
    });
  });

  describe('Find an user', () => {
    let _id: string;

    it('Found an user by username', async () => {
      const resp = await request(api)
        .get(`/user/${userValid.username}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(resp.body._id).toBeDefined();
      expect(resp.body._id).not.toBeNull();
      expect(resp.body.password).not.toBeDefined();
      expect(resp.body.username).toEqual(
        userValid.username.trim().toLocaleLowerCase(),
      );
      expect(resp.body.name).toEqual(userValid.name);
      expect(resp.body.createdAt).toBeDefined();
      expect(resp.body.updatedAt).toBeDefined();

      //reserved Id off user
      _id = resp.body._id;
    });

    it('Found an user by Id', async () => {
      const resp = await request(api)
        .get(`/user/Id/${_id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(resp.body._id).toBeDefined();
      expect(resp.body._id).not.toBeNull();
      expect(resp.body._id).toEqual(_id);
      expect(resp.body.password).not.toBeDefined();
      expect(resp.body.username).toEqual(
        userValid.username.trim().toLocaleLowerCase(),
      );
      expect(resp.body.name).toEqual(userValid.name);
      expect(resp.body.createdAt).toBeDefined();
      expect(resp.body.updatedAt).toBeDefined();
    });
  });

  describe('Find all user', () => {
    it('Found all user', async () => {
      const resp = await request(api)
        .get(`/user`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(resp.body.users)).toBeTruthy();
      expect(resp.body.users.length).toBeGreaterThanOrEqual(1);

      const item = resp.body.users[0];
      expect(item._id).toBeDefined();
      expect(item._id).not.toBeNull();
      //expect(item.password).not.toBeDefined();
      expect(item.username).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.createdAt).toBeDefined();
      expect(item.updatedAt).toBeDefined();

      expect(resp.body.users).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: userValid.name,
            username: userValid.username.trim().toLocaleLowerCase(),
          }),
        ]),
      );
    });
  });

  describe('Update an user', () => {
    let _id: string;
    let userUpdate;
    let updatedAt;

    it('Found an user', async () => {
      const resp = await request(api)
        .get(`/user/${userValid.username}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(resp.body.username).toEqual(
        userValid.username.trim().toLocaleLowerCase(),
      );
      expect(resp.body._id).toBeDefined();
      expect(resp.body._id).not.toBeNull();

      _id = resp.body._id;
      userUpdate = new UpdateUserDto(resp.body);
      userUpdate.name = faker.name.fullName();
      userUpdate.isActive = false;

      updatedAt = resp.body.updatedAt;
    });

    it('Update an user - should handle not found', async () => {
      const _idFaker = faker.datatype.uuid();
      const resp = await request(api)
        .patch(`/user/${_idFaker}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(userUpdate)
        .expect(HttpStatus.NOT_FOUND);

      expect(resp.body.error).toBe(`Id not found: (${_idFaker})`);
    });

    it('To Validate action not of update an user', async () => {
      const resp = await request(api)
        .get(`/user/Id/${_id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(resp.body.username).toEqual(
        userValid.username.trim().toLocaleLowerCase(),
      );
      expect(resp.body.name).not.toEqual(userUpdate.name);
      expect(resp.body.isActive).not.toEqual(userUpdate.isActive);
      expect(resp.body.updatedAt).toEqual(updatedAt);
    });

    it('Update an user', async () => {
      const resp = await request(api)
        .patch(`/user/${_id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(userUpdate)
        .expect(HttpStatus.OK);

      expect(resp.body.result.ok).toEqual(1);
    });

    it('To Validate action of update an user', async () => {
      const resp = await request(api)
        .get(`/user/Id/${_id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(resp.body.username).toEqual(
        userValid.username.trim().toLocaleLowerCase(),
      );
      expect(resp.body.name).toEqual(userUpdate.name);
      expect(resp.body.isActive).toEqual(userUpdate.isActive);
      expect(resp.body.updatedAt).not.toEqual(updatedAt);
    });
  });

  describe('Delete an user', () => {
    let _id: string;

    it('Found an user', async () => {
      const resp = await request(api)
        .get(`/user/${userValid.username}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(resp.body.username).toEqual(
        userValid.username.trim().toLocaleLowerCase(),
      );
      expect(resp.body._id).toBeDefined();
      expect(resp.body._id).not.toBeNull();

      _id = resp.body._id;
    });

    it('Delete an user', async () => {
      const resp = await request(api)
        .delete(`/user/${_id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(resp.body.result.ok).toEqual(1);
    });

    it('To Validate action of delete an user', async () => {
      await request(api)
        .get(`/user/Id/${_id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect(/Id not found/);
    });

    it('Delete an user - should handle not found', async () => {
      const _idFaker = faker.datatype.uuid();
      const resp = await request(api)
        .delete(`/user/${_idFaker}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.BAD_REQUEST);

      expect(resp.body.error).toBe(`user not deleted`);
    });
  });
});
