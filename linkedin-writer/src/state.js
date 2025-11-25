import { Annotation, MessagesAnnotation } from '@langchain/langgraph';

export const LinkedinState = Annotation.Root({
  ...MessagesAnnotation.spec,
});
