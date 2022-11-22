import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BaseEntity,
  ObjectIdColumn,
} from 'typeorm';

@Entity()
@Index(['username'], { unique: true })
export class User extends BaseEntity {
  @ObjectIdColumn()
  _id: string;

  @ApiProperty({
    example: 'cristian.amaral',
    description: 'The user of login',
  })
  @Column({ nullable: false })
  username: string;

  @Column({ nullable: false })
  password: string;

  @ApiProperty({
    example: 'Cristian dos Santos Amaral',
    description: 'The name of user',
  })
  @Column({ nullable: false })
  name: string;

  @Column()
  hashedRt: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
