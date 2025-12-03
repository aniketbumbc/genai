import { Annotation, MessagesAnnotation } from '@langchain/langgraph';

/**
 *  Initial state of application
 */
export const LinkedinState = Annotation.Root({
  ...MessagesAnnotation.spec,
  revisions: Annotation({
    reducer: (x, y) => y ?? x ?? 0,
    default: () => 0,
  }),
});
