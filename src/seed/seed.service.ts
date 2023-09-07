import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { In, Repository } from 'typeorm';
import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';
import { UsersService } from 'src/users/users.service';
import { ItemsService } from 'src/items/items.service';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { List } from 'src/lists/entities/list.entity';
import { ListItemService } from 'src/list-item/list-item.service';
import { ListsService } from 'src/lists/lists.service';

@Injectable()
export class SeedService {

    private isProd: boolean;

    constructor(
        private readonly configService:ConfigService,
        @InjectRepository(Item) 
        private readonly itemRepository: Repository<Item>,

        @InjectRepository(User) 
        private readonly usersRepository: Repository<User>,

        @InjectRepository(ListItem)
        private readonly listItemRepository: Repository<ListItem>,

        @InjectRepository(List)
        private readonly listRepository: Repository<List>,

        private readonly usersService: UsersService,
        private readonly itemsService: ItemsService,
        private readonly listItemService: ListItemService,
        private readonly listService: ListsService,
    ) {
        this.isProd = this.configService.get('STATE')==='prod';
    }

    async executeSeed():Promise<boolean> {
        if(this.isProd) {
            throw new UnauthorizedException('No se puede ejecutar el seed en producción');
        }

        //Limpiar la base de datos BORRAR TODO
        await this.deleteDataBase();

        // Crear usuarios
        const user=await this.loadUsers();
        // Crear items
        await this.loadItems(user);

        // Crear listas
        const list =await this.loadLists(user );

        // Crear listItems
        const items = await this.itemsService.findAll(user, {limit: 15, offset:0}, {});
        await this.loadLitsItems(list, items);

        return true;
    }

    async deleteDataBase(){
        // Borrar ListItems
        await this.listItemRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        // Borrar Listas
        await this.listRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        // Borrar Items
        await this.itemRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        //borrar usuarios
        await this.usersRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();
    }

    async loadUsers(): Promise<User> {
        const users = [];
        for (const user of SEED_USERS) {
            users.push(await this.usersService.create(user));
        }

        return users[0];
    }

    async loadItems(user: User): Promise<void> {
        const itemsPromises = [];
        for (const item of SEED_ITEMS) {
            itemsPromises.push(this.itemsService.create(item, user));
        }

        await Promise.all(itemsPromises);

    }

    async loadLists(user: User): Promise<List> {
        const lists = [];
        for (const list of SEED_LISTS) {
            lists.push(await this.listService.create(list, user));
        }
        return lists[0];
    }

    async loadLitsItems(list: List, items:Item[]): Promise<void> {
        for (const item of items) {
            this.listItemService.create({
                itemId: item.id,
                listId: list.id,
                quantity: Math.round(Math.random() * 10),
                completed: Math.round(Math.random() * 1) === 0 ? false:true,
            });
        }
    }
}
