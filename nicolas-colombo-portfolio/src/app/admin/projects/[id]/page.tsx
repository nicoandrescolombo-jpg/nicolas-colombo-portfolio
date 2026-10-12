import React from 'react'
import { notFound } from 'next/navigation'
import { getProjectById } from '@/lib/queries/projects'
import ProjectForm from '@/components/admin/ProjectForm'

interface EditProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params
  const project = await getProjectById(id)

  if (!project) {
    notFound()
  }

  return <ProjectForm initialProject={project} />
}
