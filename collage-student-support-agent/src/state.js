import { Annotation, MessagesAnnotation } from '@langchain/langgraph';

export const StateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  nextRepresentative: Annotation({
    reducer: (x, y) => y ?? x, // One line - always works
    default: () => '',
  }),
});
