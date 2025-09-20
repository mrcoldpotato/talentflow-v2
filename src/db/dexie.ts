// src/db/dexie.ts
import Dexie, { Table } from 'dexie';
import type { Job, Candidate, TimelineEvent, Assessment } from '../types';

export class AppDB extends Dexie {
  jobs!: Table<Job, string>;
  candidates!: Table<Candidate, string>;
  timelines!: Table<TimelineEvent, string>;
  assessments!: Table<Assessment, string>; // one assessment per job

  constructor() {
    super('TalentFlowDB');

    this.version(1).stores({
      jobs: 'id, title, status, order',
      candidates: 'id, name, email, jobId, stage, createdAt',
      timelines: 'id, candidateId, type, ts',
      assessments: 'jobId', // jobId is the primary key
    });
  }
}

export const db = new AppDB();
