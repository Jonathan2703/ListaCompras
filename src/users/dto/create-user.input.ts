import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsStrongPassword, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field(()=>String)
    @IsEmail()
    email: string;

    @Field(()=>String)
    @IsNotEmpty()
    fullName: string;

    @Field(()=>String)
    @MinLength(6)
    // @IsStrongPassword()
    password: string;
}
