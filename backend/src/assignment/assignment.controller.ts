import { Controller, Get, Param, Put, Query } from '@nestjs/common';
import {
  dbChangeAssignmentState,
  dbGetAssignmentsForUserGroupFromCurrentInterval,
} from 'src/db/functions/assignment';
import { AssignmentState } from 'src/db/schema';
import { AssignmentResponse } from './types';

@Controller('assignments')
export class AssignmentController {
  @Get()
  async getAllAssignments(
    @Query('groupId') groupId: number,
  ): Promise<AssignmentResponse[]> {
    return await dbGetAssignmentsForUserGroupFromCurrentInterval(groupId);
  }

  // TODO: should be put
  @Put('/:id/:state')
  async changeAssignmentState(
    @Param('id') id: number,
    @Param('state') state: AssignmentState,
  ) {
    await dbChangeAssignmentState(id, state);
  }
}
