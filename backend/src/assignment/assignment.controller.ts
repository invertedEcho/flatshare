import { Controller, Get, Param, Post } from '@nestjs/common';
import {
  dbChangeAssignmentState,
  dbGetAssignmentsFromCurrentInterval,
} from 'src/db/functions/assignment';
import { AssignmentState } from 'src/db/schema';
import { AssignmentResponse } from 'src/types';

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
