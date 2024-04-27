import { Controller, Get } from '@nestjs/common';
import { dbGetAllAssignments } from './db/assignment';
import { AssignmentResponse } from './types';

@Controller('assignments')
export class AssignmentController {
  @Get()
  async getAllAssignments(): Promise<AssignmentResponse[]> {
    return await dbGetAllAssignments();
  }
}
