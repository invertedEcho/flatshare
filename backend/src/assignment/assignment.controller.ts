import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  dbChangeAssignmentState,
  dbGetAssignmentsFromCurrentInterval,
} from 'src/db/functions/assignment';
import { AssignmentState } from 'src/db/schema';
import { AssignmentResponse } from 'src/types';

@Controller('assignments')
export class AssignmentController {
  @Get()
  async getAllAssignments(
    // TODO: make this optional, just like a query param should be
    @Query('groupId') groupId: number,
  ): Promise<AssignmentResponse[]> {
    return await dbGetAssignmentsFromCurrentInterval(groupId);
  }

  // TODO: should be put
  @Post('/:id/:state')
  async changeAssignmentState(
    @Param('id') id: number,
    @Param('state') state: AssignmentState,
  ) {
    await dbChangeAssignmentState(id, state);
  }
}
