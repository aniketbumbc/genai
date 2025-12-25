import { Annotation, MessagesAnnotation } from '@langchain/langgraph';
import { z } from 'zod';



export const reflectionSchema = z.object({
  missing: z.string().describe('missing information in the answer'),
  superflous: z.string().describe('critique of the superflous information in the answer'),
})





export const questoinAnswerSchema = z.object({
  answer: z.string().describe('~250 wrods detailed answer of the question'),
  reflection: reflectionSchema,
  searchQueries: z.array(z.string()).describe('1 to 3 search queries to research improvement to address the critique of the current answer'),
})



/**
 *  Initial state of application
 */
export const graphState = Annotation.Root({
  ...MessagesAnnotation.spec,
});

/**
 *  revisions: Annotation({
    reducer: (x, y) => y ?? x ?? 0,
    default: () => 0,
  }),
 */
