import { BaseEntity } from 'typeorm';
export declare class User extends BaseEntity {
    _id: string;
    username: string;
    password: string;
    name: string;
    hashedRt: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    constructor(user?: Partial<User>);
}
