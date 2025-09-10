import { StateGraph, MessagesAnnotation, END } from '@langchain/langgraph';
import { writeFileSync } from 'node:fs';

const enrollToSchool = (state) => {
  console.log('Student gets enroll to school');
  return state;
};

const getStudentId = (state) => {
  console.log('Student gets school id');
  return state;
};

const getSchoolBag = (state) => {
  console.log('Student gets school Bag');
  return state;
};

const getBooks = (state) => {
  console.log('Student gets books from school');
  return state;
};

const enrollToClass = (state) => {
  console.log('Student can enroll to class');
  return state;
};

const whereToGo = () => {
  if (true) {
    return '__end__';
  } else {
    return 'getBooks';
  }
};

const graph = new StateGraph(MessagesAnnotation)
  .addNode('enrollToSchool', enrollToSchool)
  .addNode('getStudentId', getStudentId)
  .addNode('getSchoolBag', getSchoolBag)
  .addNode('getBooks', getBooks)
  .addNode('enrollToClass', enrollToClass)
  .addEdge('__start__', 'enrollToSchool')
  .addEdge('enrollToSchool', 'getStudentId')
  .addEdge('getStudentId', 'getSchoolBag')
  .addEdge('getSchoolBag', 'getBooks')
  .addEdge('getBooks', 'enrollToClass')
  .addConditionalEdges('enrollToClass', whereToGo, {
    __end__: END,
    getBooks: 'getBooks',
  });

const studentAdmissionProcess = graph.compile();

const main = async () => {
  const finalResult = await studentAdmissionProcess.invoke({
    messages: [],
  });

  const drawableGraphGraphState = await studentAdmissionProcess.getGraphAsync();
  const graphStateImage = await drawableGraphGraphState.drawMermaidPng();
  const graphStateArrayBuffer = await graphStateImage.arrayBuffer();

  const filePath = './studentAdmission.png';
  writeFileSync(filePath, new Uint8Array(graphStateArrayBuffer));

  console.log('finalResult: - ', finalResult);
};

main();
