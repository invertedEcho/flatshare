import { Module } from '@nestjs/common';
import { AssignmentSchedulerService } from './assignment-scheduler.service';

@Module({
  providers: [AssignmentSchedulerService],
})
export class AssignmentsModule {}
