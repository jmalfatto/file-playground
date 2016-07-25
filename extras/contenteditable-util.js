contentEditableUtil = {

    highlightAllProhibitedWords: function (node, prohibited) {
        if (!node || typeof node.textContent === 'undefined') {
            return;
        }

        var me = this;

        // start fresh and normalize in case text is split up into different nodes
        me.removeAllMarkup(node);
        node.normalize();

        prohibited.forEach(function (word) {
            var i = 0, childNode, str,
                startOffset, endOffset, range;

            for(i; i<node.childNodes.length; i++) {
                childNode = node.childNodes[i];
                if (childNode.nodeName === '#text') {
                    str = childNode.nodeValue,
                        startOffset = str.indexOf(word),
                        endOffset = startOffset + word.length,
                        range = document.createRange();

                    if (startOffset > -1) {
                        me.highlightRange(childNode, startOffset, endOffset);
                    }
                }
            }
        });

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

    getSelectedRange: function () {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            return range = sel.getRangeAt(0);
        }
    },

    getFirstNodeText: function (node, returnNode) {
        var i, text;
        if (node.nodeName === '#text') {
            return returnNode ? node : node.textContent;
        } else {
            for (i=0; i<node.childNodes.length; i++) {
                text = getFirstNodeText(node.childNodes[i], returnNode);
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