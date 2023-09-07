import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SingupInput, LoginInput } from './dto/inputs';
import { AuthResponse } from './types/auth-response.type';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ){}

    private getJWTToken(userId: string): string {
        return this.jwtService.sign({id: userId});
    }

    async singup(singupInput: SingupInput): Promise<AuthResponse> {
        const user = await this.usersService.create(singupInput);

        const token = this.getJWTToken(user.id);
        return{
            token,
            user
        }
    }

    async login(loginInput:LoginInput): Promise<AuthResponse> {
        const {email, password} = loginInput;
        const user = await this.usersService.findOneByEmail(email);

        if(!bcrypt.compareSync(password, user.password)){
            throw new BadRequestException('Invalid credentials');
        }
        
        const token = this.getJWTToken(user.id);
        return {
            token,
            user,
        }
    }

    async validateUser (id:string): Promise<User>{
        const user = await this.usersService.findOneById(id);
        if(!user.isActive) throw new UnauthorizedException(`User is not active, talk to the admin`);

        delete user.password;
        return user;
    }

    revalidateToken(user: User): AuthResponse {
        const token = this.getJWTToken(user.id);
        return {
            token,
            user
        }
    }
}
