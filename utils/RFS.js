const RFS = {
  createElement,
  render,
}

// use spread operator on children so that returned object always has children property
function createElement(type, props, ...children) {
  console.log('creating element with type: ', type);
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

function render(element, container) {
  console.log('creating element: ', element);

  const elementDOM = element.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type);

  Object.keys(element.props).filter(key => key !== 'children').forEach(key => elementDOM[key] = element.props[key]);

  element.props.children.forEach(child => {
    render(child, elementDOM);
  });

  container.appendChild(elementDOM);
}

export { render, createElement }