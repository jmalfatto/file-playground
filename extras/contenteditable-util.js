contentEditableUtil = {

    isRangeWithinStyleNode: function () {
        var tagRegex = /^(span|font|b|strong)$/;
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var range = sel.getRangeAt(0);
            var parentNodeName = range.startContainer.parentNode.nodeName.toLowerCase();
            return tagRegex.test(parentNodeName);
        }
        return false;
    },

    isRangeWordProhibited: function (prohibited) {
        var word = this.getRangeWord();

        if (!Array.isArray(prohibited)) {
            return false;
        }

        return prohibited.indexOf(word) > -1 ? true : false;
    },

    getRangeWord: function () {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var range = sel.getRangeAt(0);
            var isCaret = range.startOffset === range.endOffset;
            var text = range.startContainer.textContent;

            if (!isCaret) {
                return text.substring(range.startOffset, range.endOffset);
            } else {
                var leftBarrier = this.findWordBreak(text, range.startOffset, 'l');
                var rightBarrier = this.findWordBreak(text, range.startOffset, 'r');
                return text.substring(leftBarrier, rightBarrier);
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
    }

};