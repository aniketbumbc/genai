import { Annotation, MessagesAnnotation } from '@langchain/langgraph';

/**
 *  Initial state of application
 */
export const LinkedinState = Annotation.Root({
  ...MessagesAnnotation.spec,
});
