export type JobStatus = 'active' | 'archived'

export interface Job {
  id: string
  title: string
  slug: string
  status: JobStatus
  tags: string[]
  order: number
  createdAt: string
  updatedAt?: string
}

export type CandidateStage = 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected'

export interface Candidate {
  id: string
  name: string
  email: string
  jobId?: string
  stage: CandidateStage
  notes?: string[]
  createdAt: string
}

export interface TimelineEvent {
  id: string
  candidateId: string
  type: 'stage' | 'note'
  from?: string
  to?: string
  note?: string
  ts: string
}

export interface AssessmentQuestion {
  id: string
  type: 'single' | 'multi' | 'short' | 'long' | 'numeric' | 'file'
  question: string
  options?: string[]
  required?: boolean
  condition?: { questionId: string; equals: any } | null
  numericRange?: { min?: number; max?: number }
  maxLength?: number
}

export interface AssessmentSection {
  id: string
  title: string
  questions: AssessmentQuestion[]
}

export interface Assessment {
  jobId: string
  title: string
  sections: AssessmentSection[]
  updatedAt?: string
}
