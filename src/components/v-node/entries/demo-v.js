import Element from '../lib/element';
import Diff from '../lib/diff';
import Patch from '../lib/patch';

import './demo.css';

const renderVirtualDom = () => {
    const tree = Element('div', { id: 'virtual-container' }, [
        Element('p', {}, ['Virtual DOM']),
        Element('div', {}, ['before update']),
        Element('ul', {}, [
            Element('li', { class: 'item' }, ['Item 1']),
            Element('li', { class: 'item' }, ['Item 2']),
            Element('li', { class: 'item' }, ['Item 3']),
        ]),
    ]);

    const root = tree.render();
    document.getElementById('app').appendChild(root);

    const newTree = Element('div', { id: 'virtual-container' }, [
        Element('h3', {}, ['Virtual DOM']), // REPLACE
        Element('div', {}, ['after update']), // TEXT
        Element('ul', { class: 'marginLeft10' }, [ // PROPS
            Element('li', { class: 'item', py: 'test' }, ['Item 1']),
            // Element('li', { class: 'item' }, ['Item 2']),    // REORDER remove
            Element('li', { class: 'item' }, ['Item 3']),
            Element('li', { class: 'item', style: 'font-size: 20px;' }, ['hello world'])
        ]),
    ]);
    console.log(Diff(tree, newTree))

    setTimeout(() => {
        const patches = Diff(tree, newTree);
        Patch(root, patches);
    }, 2000);
};

export default renderVirtualDom();