import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { StorageService } from '../../infra/storage/storage.service';

@Module({
  controllers: [FilesController],
  providers: [StorageService],
  exports: [StorageService],
})
export class FilesModule {}
