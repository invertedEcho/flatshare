import { Controller, Get } from '@nestjs/common';
import { dbGetAllAssignments } from './db/assignment';

@Controller('assignments')
export class AssignmentController {
  @Get()
  async getAllAssignments(): Promise<AssignmentResponse[]> {
    return await dbGetAllAssignments();
  }
}
