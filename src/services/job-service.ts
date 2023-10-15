import parser from 'cron-parser';
import { DateTime } from 'luxon';
import schedule from 'node-schedule';

import { Logger } from './index.js';
import { Job } from '../jobs/index.js';


export class JobService {
    private logger = new Logger();
    constructor(private jobs: Job[]) {}

    public start(): void {
        for (let job of this.jobs) {
            let jobSchedule = job.runOnce
                ? parser
                      .parseExpression(job.schedule, {
                          currentDate: DateTime.now()
                              .plus({ seconds: job.initialDelaySecs })
                              .toJSDate(),
                      })
                      .next()
                      .toDate()
                : {
                      start: DateTime.now().plus({ seconds: job.initialDelaySecs }).toJSDate(),
                      rule: job.schedule,
                  };

            schedule.scheduleJob(jobSchedule, async () => {
                try {
                    if (job.log) {
                        this.logger.info(`Job ${job.name} is running`);
                    }

                    await job.run();

                    if (job.log) {
                        this.logger.info(`Job ${job.name} completed`);
                    }
                } catch (error) {
                    this.logger.error(`Job ${job.name} failed: ${error}`);
                }
            });
            this.logger.info(
                `Job ${job.name} scheduled to run ${job.schedule} starting`
            );
        }
    }
}
