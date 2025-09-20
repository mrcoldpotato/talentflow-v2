import { db } from './dexie'
import { Job, Candidate, Assessment } from '../types'
import { nanoid } from 'nanoid'
import dayjs from 'dayjs'

const JOB_COUNT = 25
const CANDIDATE_COUNT = 1000

function rand(a:number,b:number){ return Math.floor(Math.random()*(b-a+1))+a }

export async function seedIfEmpty(){
  const jobsCount = await db.jobs.count()
  if (jobsCount > 0) return
  const tagsPool = ['frontend','backend','devops','design','prod','hr','fullstack']
  const jobs: Job[] = Array.from({length: JOB_COUNT}).map((_, i) => {
    const title = `${['Senior','Junior','Lead','Principal'][i%4]} ${['Engineer','Designer','Manager'][i%3]} ${i+1}`
    const id = nanoid()
    return { id, title, slug: title.toLowerCase().replace(/\s+/g,'-'), status: (Math.random()>0.3)?'active':'archived', tags: [tagsPool[i%tagsPool.length]], order: i, createdAt: dayjs().subtract(i,'day').toISOString() }
  })
  await db.jobs.bulkAdd(jobs)

  const stages = ['applied','screen','tech','offer','hired','rejected']
  const candidates: Candidate[] = Array.from({length: CANDIDATE_COUNT}).map((_,i) => {
    const id = nanoid()
    const name = `Candidate ${i+1}`
    const job = jobs[rand(0,jobs.length-1)]
    return { id, name, email: `candidate${i+1}@example.com`, jobId: Math.random()>0.2?job.id:undefined, stage: stages[rand(0,stages.length-1)] as Candidate['stage'], createdAt: dayjs().subtract(rand(0,365),'day').toISOString() }
  })
  await db.candidates.bulkAdd(candidates)

  const assessments: Assessment[] = jobs.slice(0,3).map(job => ({
    jobId: job.id,
    title: `${job.title} Assessment`,
    sections: [{
      id: nanoid(),
      title: 'General',
      questions: Array.from({length:10}).map((__, qi) => ({
        id: nanoid(),
        type: ['single','short','numeric'][qi%3] as any,
        question: `Question ${qi+1}`,
        options: qi%3===0?['Yes','No','Maybe']:undefined,
        required: qi%2===0
      }))
    }]
  }))
  await db.assessments.bulkAdd(assessments)
}
