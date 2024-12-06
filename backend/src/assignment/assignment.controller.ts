import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import {
  dbUpdateAssignmentState,
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

  @Patch('/:id/:state')
  async updateAssignmentState(
    @Param('id') id: number,
    @Param('state') state: AssignmentState,
  ) {
    await dbUpdateAssignmentState(id, state);
  }
}
