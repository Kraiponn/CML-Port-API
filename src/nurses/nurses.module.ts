import { Module } from '@nestjs/common';
import { NursesService } from 'src/nurses/nurses.service';
import { NursesController } from 'src/nurses/nurses.controller';

@Module({
  providers: [NursesService],
  controllers: [NursesController],
})
export class NursesModule {}
