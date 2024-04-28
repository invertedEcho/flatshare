import { Controller, Get, Param, Post } from '@nestjs/common';
import { dbChangeAssignmentState, dbGetAllAssignments } from './db/assignment';
import { AssignmentResponse } from './types';
import { AssignmentState } from './db/schema';

@Controller('assignments')
export class AssignmentController {
  @Get()
  async getAllAssignments(): Promise<AssignmentResponse[]> {
    return await dbGetAllAssignments();
  }

  @Post('/:id/:state')
  async changeAssignmentState(
    @Param('id') id: number,
    @Param('state') state: AssignmentState,
  ) {
    await dbChangeAssignmentState(id, state);
  }
}
