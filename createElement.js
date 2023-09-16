// use spread operator on children so that returned object always has children property
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children
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
  const elementDOM = element.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type);

  Object.keys(element.props).filter(key => key !== 'children').forEach(key => elementDOM[key] = element.props[key]);

  element.props.children.forEach(child => {
    render(child, elementDOM);
  });

  container.appendChild(elementDOM);
}

const RFS = {
  createElement,
  render,
}

/* const element = RFS.createElement(
  'div',
  { id: 'title' },
  RFS.createElement('a', null, 'Hello React!'),
  RFS.createElement('b')
); */

// when babel transpiles the JSX, it will use the function we define
/** @jsx RFS.createElement */
const element = (
  <div id='title'>
    <a>Hello React!</a>
    <b />
  </div>
)
const container = document.getElementById('root');
RFS.render(element, container); 