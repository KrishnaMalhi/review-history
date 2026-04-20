import { Module } from '@nestjs/common';
import { CategoryExtensionsService } from './category-extensions.service';
import { CategoryExtensionsController } from './category-extensions.controller';

@Module({
  controllers: [CategoryExtensionsController],
  providers: [CategoryExtensionsService],
  exports: [CategoryExtensionsService],
})
export class CategoryExtensionsModule {}
