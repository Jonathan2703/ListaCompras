import { InputType, Field, ID } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

@InputType()
export class CreateListItemInput {
  @Field(() => ID)
  @IsUUID()
  itemId: string;

  @Field(() => ID)
  @IsUUID()
  listId: string;

  @Field(() => Number, {nullable:true})
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity: number=0;

  @Field(() => Boolean, {nullable:true})
  @IsBoolean()
  @IsOptional()
  completed: boolean=false;
}
