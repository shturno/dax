import { z } from "zod"

export const userSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  username: z.string().min(3, "O nome de usuário deve ter pelo menos 3 caracteres").optional(),
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").optional(),
})

export const projectSchema = z.object({
  name: z.string().min(3, "O nome do projeto deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  ownerId: z.string(),
  tasks: z.array(z.object({
    title: z.string(),
    completed: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date()
  })).optional(),
  notes: z.array(z.object({
    content: z.string(),
    createdAt: z.date(),
    updatedAt: z.date()
  })).optional(),
  roadmap: z.array(z.object({
    title: z.string(),
    status: z.enum(["planned", "in_progress", "completed"]),
    dueDate: z.date().optional(),
    createdAt: z.date(),
    updatedAt: z.date()
  })).optional(),
  features: z.array(z.object({
    title: z.string(),
    description: z.string(),
    status: z.enum(["planned", "in_progress", "completed"]),
    priority: z.enum(["low", "medium", "high"]),
    createdAt: z.date(),
    updatedAt: z.date()
  })).optional(),
  ideas: z.array(z.object({
    title: z.string(),
    description: z.string(),
    status: z.enum(["new", "in_progress", "completed", "archived"]),
    createdAt: z.date(),
    updatedAt: z.date()
  })).optional(),
  feedback: z.array(z.object({
    content: z.string(),
    type: z.enum(["bug", "feature", "improvement"]),
    status: z.enum(["new", "in_progress", "resolved"]),
    createdAt: z.date(),
    updatedAt: z.date()
  })).optional()
})

export const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  language: z.string().default("pt-BR"),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true)
  }).default({}),
  timezone: z.string().default("America/Sao_Paulo")
})

export const taskSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  completed: z.boolean().default(false),
  dueDate: z.date().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  projectId: z.string()
})

export const noteSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  content: z.string(),
  projectId: z.string()
})

export const featureSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string(),
  status: z.enum(["planned", "in_progress", "completed"]).default("planned"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  projectId: z.string()
})

export const feedbackSchema = z.object({
  content: z.string().min(10, "O feedback deve ter pelo menos 10 caracteres"),
  type: z.enum(["bug", "feature", "improvement"]),
  projectId: z.string()
}) 