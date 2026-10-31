import { Controller, Get, Query } from '@nestjs/common';
import { AuditLogQuerySchema, Role } from '@dars/contracts';
import { AdminService } from './admin.service';
import { AuditService } from '../audit/audit.service';
import { Roles } from '../../common/decorators/roles.decorator';

@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly auditService: AuditService,
  ) {}

  @Get('overview')
  async getOverview() {
    const data = await this.adminService.getOverview();
    return { data };
  }

  @Get('audit-log')
  async getAuditLog(@Query() query: unknown) {
    const parsed = AuditLogQuerySchema.parse(query);
    const result = await this.auditService.listLogs(parsed);
    return {
      data: result.items,
      meta: {
        page: parsed.page,
        limit: parsed.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / parsed.limit) || 1,
      },
    };
  }
}
