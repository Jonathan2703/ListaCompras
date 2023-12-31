import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

@InputType()
export class CreateItemInput {
  @Field(()=>String)
  @IsNotEmpty()
  @IsString()
  name: string;

  // @Field(() => Float)
  // @IsPositive()
  // quantity: number;

  @Field(()=>String, {nullable:true})
  @IsString()
  @IsOptional()
  quantityUnits?: string;
}
