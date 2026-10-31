import {
  Controller,
  Get,
  Param,
  Res,
  Headers,
} from '@nestjs/common';
import { Response } from 'express';
import { StorageService } from '../../infra/storage/storage.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('files')
export class FilesController {
  constructor(private readonly storageService: StorageService) {}

  @Public()
  @Get(':id')
  async downloadFile(
    @Param('id') id: string,
    @Res() res: Response,
    @Headers('range') _range?: string,
  ) {
    const fullPath = this.storageService.getFilePath(id);
    res.setHeader('Content-Disposition', `attachment; filename="${id}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(fullPath);
  }
}
