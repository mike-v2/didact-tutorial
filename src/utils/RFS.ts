const RFS = {
  createElement,
  render,
}

type Fiber = {
  type: string;
  props: {
    [key: string]: any;
    children: Fiber[];
  };
  domNode?: HTMLElement | Text | null;
  parent?: Fiber;
  sibling?: Fiber;
  firstChild?: Fiber;
};


// use spread operator on children so that returned object always has children property
function createElement(type: string, props?: Record<string, any>, ...children: Fiber[]): Fiber {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === 'object' ? child : createTextElement(child))
    }
  }
}

// children that are primitives instead of nodes (objects)
function createTextElement(text: string): Fiber {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    }
  }
}

function createDomNode(fiber: Fiber): HTMLElement | Text {
  const fiberDomNode = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type);
  Object.keys(fiber.props).filter(key => key !== 'children').forEach(key => (fiberDomNode as any)[key] = fiber.props[key]);

  return fiberDomNode;
}

function render(element: Fiber, container: HTMLElement) {
  nextUnitOfWork = {
    type: 'ROOT', // type is not needed since it's already rendered, but we include a special type here to conform to Fiber type
    domNode: container,
    props: {
      children: [element]
    }
  }
}

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}

function performUnitOfWork(fiber: Fiber): Fiber | null {
  // create DOM node for fiber and append to DOM parent
  if (!fiber.domNode) fiber.domNode = createDomNode(fiber);
  if (fiber.parent) fiber.parent.domNode!.appendChild(fiber.domNode!);

  // create fiber for each child
  let prevSibling: Fiber | null = null;
  for (let i = 0; i < fiber.props.children.length; i++) {
    const element = fiber.props.children[i];

    const newFiber: Fiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      domNode: null
    }

    if (i === 0) {
      fiber.firstChild = newFiber;
    } else {
      prevSibling!.sibling = newFiber;
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

    if (!nextFiber.parent) break;
    nextFiber = nextFiber.parent;
  }

  return null;
}

let nextUnitOfWork: Fiber | null = null;
requestIdleCallback(workLoop);

export { render, createElement }