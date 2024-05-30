import { Controller, Get, Param, Post } from '@nestjs/common';
import {
  dbChangeAssignmentState,
  dbGetAssignmentsFromCurrentInterval,
} from './db/functions/assignment';
import { AssignmentResponse } from './types';
import { AssignmentState } from './db/schema';

@Controller('assignments')
export class AssignmentController {
  @Get()
  async getAllAssignments(): Promise<AssignmentResponse[]> {
    return await dbGetAssignmentsFromCurrentInterval();
  }

  @Post('/:id/:state')
  async changeAssignmentState(
    @Param('id') id: number,
    @Param('state') state: AssignmentState,
  ) {
    await dbChangeAssignmentState(id, state);
  }
}
