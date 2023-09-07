import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { SingupInput } from '../auth/dto/inputs/signup.input';
import { Repository } from 'typeorm';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

@Injectable()
export class UsersService {

  private logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ){}

  async create(singupInput:SingupInput): Promise<User> {
    try {
      const newUser = this.usersRepository.create({
        ...singupInput,
        password: bcrypt.hashSync(singupInput.password, 10)
      });
      return await this.usersRepository.save(newUser);
      
    } catch (error) {
      console.log(error);
      this.handleDBErrors(error);
    }
  }

  async findAll(roles:ValidRoles[], paginationArgs:PaginationArgs, searchArgs:SearchArgs): Promise<User[]> {
    const {limit, offset} = paginationArgs;
    const {search} = searchArgs;
    if (roles.length === 0) {
      return this.usersRepository.createQueryBuilder()
        .take(limit)
        .skip(offset)
        .getMany();
    };
    // ??? tenemos roles ['admin', 'superUser']
    const queryBuilder=this.usersRepository.createQueryBuilder()
      .take(limit)
      .skip(offset)
      .andWhere('ARRAY[roles] && ARRAY[:...roles]')
      .setParameter('roles', roles)
    
    if ( search ) {
      queryBuilder.andWhere(`LOWER("fullName") like :fullName`, {fullName: `%${search.toLowerCase()}%`});
    }
    return queryBuilder.getMany();
  }

  async findOneByEmail(email: string): Promise<User>   {
    try {
      return await this.usersRepository.findOneByOrFail({email});
    } catch (error) {
      this.handleDBErrors({
        code: 'error-001',
        detail: `User with email ${email} not found`
      });
    }
  }

  async findOneById(id: string): Promise<User>   {
    try {
      return await this.usersRepository.findOneByOrFail({id});
    } catch (error) {
      this.handleDBErrors({
        code: 'error-001',
        detail: `User with id: ${id} not found`
      });
    }
  }

  async update(
    id: string,
    updateUserInput: UpdateUserInput,
    userAdmin: User
    ): Promise<User> {
    try {
      const user = await this.usersRepository.preload({...updateUserInput, id});
      user.lastUpdateBy = userAdmin;
      return await this.usersRepository.save(user);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async block(id: string, adminUser:User): Promise<User> {
    const userToBlock = await this.findOneById(id);
    userToBlock.isActive = false;
    userToBlock.lastUpdateBy = adminUser;
    return await this.usersRepository.save(userToBlock);
  }

  private handleDBErrors(error: any):never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    if (error.code === 'error-001') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}

