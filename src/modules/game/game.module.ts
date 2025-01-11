import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { SocketGateway } from './socket.gateway';

@Module({
  controllers: [GameController],
  providers: [GameService, SocketGateway],
  exports: [GameService],
})
export class GameModule {}