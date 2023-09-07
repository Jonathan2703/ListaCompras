import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { Item } from './entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsReporitory: Repository<Item>,
  ) {}
  async create(createItemInput: CreateItemInput, user:User): Promise<Item> {
    const newItem = this.itemsReporitory.create({...createItemInput, user});
    return await this.itemsReporitory.save(newItem);
  }

  async findAll(user:User, paginationArgs:PaginationArgs, searchArgs:SearchArgs): Promise<Item[]> {
    
    const {limit, offset} = paginationArgs;
    const {search} = searchArgs;

    const queryBuilder = this.itemsReporitory.createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, {userId: user.id});

    if ( search ) {
      queryBuilder.andWhere(`LOWER(name) like :name`, {name: `%${search.toLowerCase()}%`});
    }
    return queryBuilder.getMany();

    // return await this.itemsReporitory.find({
    //   take: limit,
    //   skip: offset,
    //   where: {
    //     user:{
    //       id:user.id
    //     },
    //     name: Like(`%${search}%`) ///select * from items where name like '%rice%'
    //   },
    // });

  }

  async findOne(id: string, user:User): Promise<Item> {
    const item = await this.itemsReporitory.findOneBy({
      id,
      user:{
        id:user.id
      }
    });
    if ( !item ) throw new NotFoundException(`Item with id: ${ id } not found`);
    // item.user = user;
    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput, user:User): Promise<Item> {
    await this.findOne(id, user);
    const item = await this.itemsReporitory.preload(updateItemInput);
    if ( !item ) throw new NotFoundException(`Item with id: ${ id } not found`);
    return this.itemsReporitory.save(item);
  }

  async remove(id: string, user:User): Promise<Item> {
    //TODO: soft delete, integridad referencial
    const item = await this.findOne(id, user);
    await this.itemsReporitory.remove(item);
    return {...item, id};
  } 

  async itemCountByUser(user:User):Promise<number>{
    return await this.itemsReporitory.count({
      where: {
        user:{
          id:user.id
        }
      },
    })
  }
}
