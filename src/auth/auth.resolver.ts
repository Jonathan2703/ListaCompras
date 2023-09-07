import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SingupInput, LoginInput } from './dto/inputs';
import { AuthResponse } from './types/auth-response.type';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from './decorators/current-user.decorator';
import { ValidRoles } from './enums/valid-roles.enum';

@Resolver(()=>AuthResponse)
export class AuthResolver {
  constructor(
    private readonly authService: AuthService
  ) {}

  @Mutation(()=>AuthResponse,{name: 'singup'})
  async singup(
    @Args('singupInput') singupInput: SingupInput
  ):Promise<AuthResponse>{
    return this.authService.singup(singupInput);
  }

  @Mutation(()=>AuthResponse,{name: 'login'})
  async login(
    @Args('loginInput') loginInput: LoginInput
  ):Promise<AuthResponse>{
    return this.authService.login(loginInput);
  }

  @Query(()=>AuthResponse,{name:'revalidate'})
  @UseGuards(JwtAuthGuard)
  revalidateToken(
    @CurrentUser(/*[ValidRoles.admin]*/) user: User
  ):AuthResponse{
    return this.authService.revalidateToken(user);
  }

}
