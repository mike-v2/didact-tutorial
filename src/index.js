/** @jsx RFS.createElement */

import * as RFS from '../utils/RFS';
import App from './App';

const element = (
  <div id='title'>
    <p>Hello React!</p>
  </div>
)
//<App />;
const container = document.getElementById('root');
RFS.render(element, container); 