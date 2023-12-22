import { Global, Module } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UsersController } from 'src/users/users.controller';

@Global()
@Module({
  imports: [],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
