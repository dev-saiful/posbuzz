import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';
import { CreateSaleItemDto } from './create-sale-item.dto';


export class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}
