const RFS = {
  createElement,
  render,
}

// use spread operator on children so that returned object always has children property
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === 'object' ? child : createTextElement(child))
    }
  }
}

// children that are primitives instead of nodes (objects)
function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    }
  }
}

function createDomNode(fiber) {
  const fiberDomNode = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type);
  Object.keys(fiber.props).filter(key => key !== 'children').forEach(key => fiberDomNode[key] = fiber.props[key]);

  return fiberDomNode;
}

function render(element, container) {
  wipRoot = {
    domNode: container,
    props: {
      children: [element]
    }
  }

  nextUnitOfWork = wipRoot;
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

function commitRoot() {
  commitWork(wipRoot.firstChild);
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) return;

  const parentDomNode = fiber.parent.domNode;
  parentDomNode.appendChild(fiber.domNode);
  commitWork(fiber.firstChild);
  commitWork(fiber.sibling);
}

function performUnitOfWork(fiber) {
  // create DOM node for fiber and append to DOM parent
  if (!fiber.domNode) fiber.domNode = createDomNode(fiber);

  // create fiber for each child
  let prevSibling = null;
  for (let i = 0; i < fiber.props.children.length; i++) {
    const element = fiber.props.children[i];

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      domNode: null
    }

    if (i === 0) {
      fiber.firstChild = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
  }

  // find next unit of work. Pick child first, then sibling, then parent, then parent sibling
  if (fiber.firstChild) {
    return fiber.firstChild;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;

    nextFiber = nextFiber.parent;
  }
}

let wipRoot = null;
requestIdleCallback(workLoop);

export { render, createElement }