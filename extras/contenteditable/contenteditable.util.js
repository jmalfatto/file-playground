var contentEditableUtil = {

    get lastCaretPosition() {
        return this._lastCaretPosition;
    },

    set lastCaretPosition(position) {
        if (position) {
            this._lastCaretPosition = position;
        }
    },

    highlightAllProhibitedWords: function (node, prohibited) {
        var found = false;

        if (!node || typeof node.textContent === 'undefined') {
            return;
        }

        var me = this;

        // start fresh and normalize in case text is split up into different nodes
        me.removeAllMarkup(node);
        node.normalize();

        prohibited.forEach(function (word) {
            var i = 0, childNode, re, str,
                startOffset, endOffset, range;

            for(i; i<node.childNodes.length; i++) {
                childNode = node.childNodes[i];
                if (childNode.nodeName === '#text') {
                    // only work with whole words
                    re = new RegExp('\\b' + word + '\\b', 'g');
                    str = childNode.nodeValue;

                    if (re.test(str)) {
                        found = true;
                        startOffset = str.indexOf(word);
                        endOffset = startOffset + word.length,
                        range = document.createRange();
                        me.highlightRange(childNode, startOffset, endOffset);
                    }
                }
            }
        });

        return found;
    },

    scanForProhibitedWords: function (node, prohibited) {
        var found = false;

        if (!node || typeof node.textContent === 'undefined') {
            return;
        }

        var me = this;

        prohibited.forEach(function (word) {
            var i = 0, childNode, re, str;

            for(i; i<node.childNodes.length; i++) {
                childNode = node.childNodes[i];
                if (childNode.nodeName === '#text') {
                    // only work with whole words
                    re = new RegExp('\\b' + word + '\\b', 'g');
                    str = childNode.nodeValue;

                    if (re.test(str)) {
                        found = true;
                    }
                }
            }
        });

        return found;
    },

    saveCaret: function (container) {
        var parentNode = this.getSelectedNode(true),
            startOffset,
            childIndex,
            nodeList,
            text,
            i,
            len = 0;
        if (!this.isOrContainedBy(container, parentNode)) {
            return;
        }
        this.lastCaretPosition = -1;
        nodeList = Array.prototype.slice.call(container.childNodes);
        if (parentNode === container && nodeList.length === 1) {
            startOffset = this.getStartOffset();
            this.lastCaretPosition = startOffset;
        } else {
            childIndex = this.getChildNodeIndex(container, parentNode),
                startOffset = this.getStartOffset();
            if (childIndex === -1) {
                parentNode = this.getSelectedNode();
                childIndex = this.getChildNodeIndex(container, parentNode);
            }
            for(i=0; i<childIndex; i++) {
                text = this.getFirstNodeText(nodeList[i]);
                len += text.length;
            }
            this.lastCaretPosition = len + startOffset;
        }
    },

    restoreCaret: function (container) {
        var nodeList,
            i,
            childNode,
            prevLen = 0,
            len = 0,
            startOffset,
            textNode;
        if (this.lastCaretPosition !== -1) {
            nodeList = Array.prototype.slice.call(container.childNodes);
            for(i=0; i<nodeList.length; i++) {
                childNode = nodeList[i];
                textNode = this.getFirstNodeText(childNode, true);
                prevLen = len;
                len += textNode.textContent.length;
                if (this.lastCaretPosition <= len) {
                    startOffset = this.lastCaretPosition - prevLen;
                    this.setCaretPosition(textNode, startOffset);
                    break;
                }
            }
        }
    },

    isRangeWordProhibited: function (prohibited) {
        var word = this.getRangeWord().text;

        if (!Array.isArray(prohibited)) {
            return false;
        }

        return prohibited.indexOf(word) > -1 ? true : false;
    },

    highlightRange: function (node, startOffset, endOffset) {
        var range = document.createRange();
        var sel = window.getSelection();

        range.setStart(node, startOffset);
        range.setEnd(node, endOffset);

        sel.removeAllRanges(); // to avoid discontiguous selection error
        sel.addRange(range);

        // avoid repeats, which will toggle the bold style
        if (!this.isRangeWithinHighlight(range)) {
            document.execCommand('styleWithCSS', false, true);
            document.execCommand('bold', false);
            document.execCommand('foreColor', false, 'red');
        }

        sel.removeAllRanges(); // This prevents default select highlight and prevents bold toggle.
    },

    removeHighlight: function (container, node) {
        var textNode = document.createTextNode(node.textContent);

        container.replaceChild(textNode, node); // replace node with just text node

        // joins adjacent text nodes that have been split by highlighting
        // detect IE11 and use custom function in that case
        if ('ActiveXObject' in window) {
            var node = container.firstChild, next, text;
            while (node) {
                next = node.nextSibling
                if (node.nodeType === 3) {
                    if (text) {
                        text.nodeValue += node.nodeValue;
                        container.removeChild(node);
                    } else {
                        text = node;
                    }
                } else {
                    text = null
                }
                node = next;
            }
        } else {
            container.normalize();
        }
    },
    
    getRangeWord: function () {
        var range = this.getSelectedRange();
        if (range) {
            var isCaret = range.startOffset === range.endOffset;
            var text = range.startContainer.textContent;

            if (!isCaret) {
                return text.substring(range.startOffset, range.endOffset);
            } else {
                var leftBarrier = this.findWordBreak(text, range.startOffset, 'l');
                var rightBarrier = this.findWordBreak(text, range.startOffset, 'r');
                return {
                    text: text.substring(leftBarrier, rightBarrier),
                    startOffset: leftBarrier,
                    endOffset: rightBarrier
                };
            }
        }
    },

    findWordBreak: function (text, index, direction) {
        var breakRegex = /\s/;
        if (direction === 'l') {
            if (index === 0) {
                return index;
            }
            var previousChar = text[index - 1];
            if (breakRegex.test(previousChar)) {
                return index;
            }
            return this.findWordBreak(text, index - 1, direction);
        } else if (direction = 'r') {
            if (breakRegex.test(text.charAt(index))
                || text.charAt(index) === '') {
                return index;
            }
            var nextChar = text[index + 1];
            if (breakRegex.test(nextChar)
                || (index === text.length - 1)) {
                return index + 1;
            }
            return this.findWordBreak(text, index + 1, direction);
        }
        return -1;
    },

    getCaretPosition: function () {
        var range = this.getSelectedRange();
        if (range) {
            return range.startOffset;
        }
        return -1;
    },

    setCaretPosition: function (node, startOffset) {
        var textNode;
        if (node.nodeName === '#text') {
            textNode = node;
        } else if (node.hasChildNodes()) {
            textNode = this.getFirstNodeText(node, true);
        } else {
            return;
        }
        node.parentNode.focus();
        var sel = window.getSelection();
        //sel.collapse(textNode, startOffset);
        var range = document.createRange();
        range.setStart(textNode, startOffset);
        range.setEnd(textNode, startOffset);
        sel.removeAllRanges();
        sel.addRange(range);
    },

    isCaretAtNodeStart: function () {
        var range = this.getSelectedRange();
        if (range) {
            // there's a bug in safari that causes it to struggle to retain ranges with 0 startOffsets in highlight node
            // e.g. shifts the startContainer to the previous node with its endOffset as startOffset
            // or else loses it completely
            // incrementing the startOffset by 1 corrects the startContainer
            return range.startOffset === (this.isSafari() && this.isRangeWithinHighlight(range) ? 1 : 0);
        }
        return false;
    },

    isCaretAtNodeEnd: function () {
        var range = this.getSelectedRange();
        if (range) {
            return range.startContainer.length === range.endOffset;
        }
        return false;
    },

    isNodeLastChild: function (node) {
        return node === node.parentNode.lastChild;
    },

    isRangeWithinHighlight: function (range) {
        var tagRegex = /^(span|font|b|strong)$/;
        range = range || this.getSelectedRange();
        if (range) {
            var parentNodeName = range.startContainer.parentNode.nodeName.toLowerCase();
            return tagRegex.test(parentNodeName);
        }
        return false;
    },

    getStartOffset: function () {
        var selection = window.getSelection(),
            range;
        if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
            return range.startOffset;
        }
    },

    getSelectedRange: function () {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            return range = sel.getRangeAt(0);
        }
    },

    getSelectedNode: function (parent) {
        var selection = window.getSelection(),
            range, container;
        if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
            container = parent ? range.startContainer.parentNode : range.startContainer;
            return container;
        }
    },

    getChildNodeIndex: function (container, node, level) {
        var i, parent, nodeList, level = level || 0;
        // limit to two levels
        if (level > 2) {
            return -1;
        }
        // traverse parentNode tree until you reach container, then find child index
        if (node === container) {
            parent = node;
        } else if (node.parentNode === container) {
            parent = node.parentNode;
        } else {
            i = this.getChildNodeIndex(container, node.parentNode, level+1);
            if (i != -1) {
                return i;
            }
        }
        if (parent) {
            nodeList = Array.prototype.slice.call(parent.childNodes);
            return nodeList.indexOf(node);
        }
        return -1;
    },

    isOrContainedBy: function (node, testNode) {
        var isSame = node === testNode;
        if (isSame) {
            return true;
        }
        if (node.hasChildNodes()) {
            return node.contains(testNode);
        }
        return false;
    },

    getFirstNodeText: function (node, returnNode) {
        var i, text;
        if (node.nodeName === '#text') {
            return returnNode ? node : node.textContent;
        } else {
            for (i=0; i<node.childNodes.length; i++) {
                text = this.getFirstNodeText(node.childNodes[i], returnNode);
                if (text) {
                    return text;
                }
            }
        }
    },

    removeAllMarkup: function (node) {
        var text = node.textContent;
        var textNode = document.createTextNode(text);
        this.removeAllChildNodes(node);
        node.appendChild(textNode);
    },

    removeAllChildNodes: function (node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
        return node;
    },

    isSafari: function () {
        return navigator.vendor && navigator.vendor.toLowerCase().indexOf('apple') > -1;
    }

};