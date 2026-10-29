import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { App } from './App';
import './style.css'; // Let's create style.css for tailwind direct inject
const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
}
//# sourceMappingURL=index.js.map