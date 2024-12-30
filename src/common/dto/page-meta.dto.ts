import { BooleanField, NumberField } from '../../decorators';
import { type PageOptionsDto } from './page-options.dto';

interface IPageMetaDtoParameters {
  pageOptionsDto: PageOptionsDto;
  itemCount: number;
}

export class PageMetaDto {
  @NumberField({ example: 1 })
  readonly page: number;

  @NumberField({ example: 10 })
  readonly take: number;

  @NumberField({ example: 1 })
  readonly itemCount: number;

  @NumberField({ example: 1 })
  readonly pageCount: number;

  @BooleanField({ example: false })
  readonly hasPreviousPage: boolean;

  @BooleanField({ example: false })
  readonly hasNextPage: boolean;

  constructor({ pageOptionsDto, itemCount }: IPageMetaDtoParameters) {
    this.page = pageOptionsDto.page;
    this.take = pageOptionsDto.take;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
