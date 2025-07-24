import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/user/user.repository';
import { User } from '../../domain/user/user.entity';
import { UserOrmEntity } from './user.orm-entity';
export declare class UserRepositoryImpl implements IUserRepository {
    private readonly repo;
    constructor(repo: Repository<UserOrmEntity>);
    findById(id: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    create(user: User): Promise<User>;
    update(user: User): Promise<User>;
    delete(id: string): Promise<void>;
    list(): Promise<User[]>;
}
