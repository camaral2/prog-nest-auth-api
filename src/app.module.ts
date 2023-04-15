import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import 'dotenv/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.MONGO_URL,
      entities: [join(__dirname, '**/**.entity{.ts,.js}')],
      synchronize: true,
      useNewUrlParser: true,
      logging: true,
      useUnifiedTopology: true,
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    const PORT = process.env.PORT || 4000;
    const PORT_MCRO = process.env.PORT_MCRO || 4010;
    const HOST_MCRO = process.env.HOST_MCRO || 'localhost';

    console.log('PORT:', PORT);
    console.log('PORT_MCRO:', PORT_MCRO);
    console.log('HOST_MCRO:', HOST_MCRO);

    Logger.log('PORT:', PORT);
    Logger.log('PORT_MCRO:', PORT_MCRO);
    Logger.log('HOST_MCRO:', HOST_MCRO);
  }
}
