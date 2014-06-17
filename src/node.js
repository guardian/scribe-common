define([], function () {

  'use strict';

  function emptyTextNode(node) {
    return (node.nodeType === Node.TEXT_NODE && node.textContent === '');
  }

  function selectionMarkerNode(node) {
    return (node.nodeType === Node.ELEMENT_NODE && node.className === 'scribe-marker');
  }

  function insertAfter(newNode, referenceNode) {
    return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  function removeNode(node) {
    return node.parentNode.removeChild(node);
  }

  return {
    emptyTextNode: emptyTextNode,
    selectionMarkerNode: selectionMarkerNode,
    insertAfter: insertAfter,
    removeNode: removeNode
  };

});
