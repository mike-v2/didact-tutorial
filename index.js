/*  
const element = <h1 className='title'>Hello React!</h1>
const container = document.getElementById('root');
ReactDOM.render(element, container); 
*/

const element = {
  type: 'h1',
  props: {
    className: 'title',
    children: 'Hello React!'
  }
}

const container = document.getElementById('root');

// render
const elementDOM = document.createElement(element.type);
elementDOM['class'] = element.props.className;

const text = document.createTextNode('');
text['nodeValue'] = element.props.children;

elementDOM.appendChild(text);
container.appendChild(elementDOM);