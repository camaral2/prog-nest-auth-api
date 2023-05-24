import { Logger } from '@nestjs/common';

const logger = new Logger(process.env.npm_package_name);
export default logger;
