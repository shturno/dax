import mongoose from 'mongoose'

const templateSchema = new mongoose.Schema({
  name: String,
  description: String,
  tasks: [String],
  notes: [String],
  roadmap: [String],
  features: [String],
  ideas: [String],
  feedback: [String]
})

export default mongoose.models.Template || mongoose.model('Template', templateSchema)