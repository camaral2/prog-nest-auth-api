import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getVersion(): any {
    return {
      app: process.env.npm_package_name,
      version: process.env.npm_package_version,
      author: 'Cristian dos Santos Amaral',
      email: 'cristian_amaral@hotmail.com',
    };
  }
}
