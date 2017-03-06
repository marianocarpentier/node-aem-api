const FormData = require('form-data');
const fs = require('fs');

/**
 * Build FormData object
 * @private
 */
function CRXPayload() {

    this.data = [];
    this.formData = new FormData();
    this.formData.append('_charset_', 'utf-8');

    this.createNode = function (path, primaryType) {
        if (typeof primaryType === 'undefined') {
            primaryType = 'nt:unstructured';
        }
        if (!path) {
            throw new TypeError('path required as first argument');
        }

        const description = JSON.stringify({'jcr:primaryType': primaryType});

        this.data.push('+' + path + ' : ' + description);
        return this;
    };

    this.moveNode = function (path, destination) {
        if (!path) {
            throw new TypeError('current path required as first argument');
        }

        if (!destination) {
            throw new TypeError('destination path required as second argument');
        }

        this.data.push('>' + path + ' : ' + destination);
        return this;
    };

    this.removeNode = function (path) {
        if (!path) {
            throw new TypeError('path required as first argument');
        }

        this.data.push('-' + path + ' : ');
        return this;
    };

    this.setProperty = function (path, property, value) {
        if (typeof value === 'undefined') {
            value = '';
        }
        if (!path) {
            throw new TypeError('path required as first argument');
        }

        if (!property) {
            throw new TypeError('property name required as second argument');
        }

        var description = '';
        if (value instanceof Date) {
            this.formData.append(path + '/' + property, Buffer.from(value.toISOString(), 'utf8'), {contentType: 'jcr-value/date'});
        } else if (value instanceof Buffer || value instanceof fs.ReadStream) {
            this.formData.append(path + '/' + property, value, {contentType: 'jcr-value/binary'});
        } else {
            description = JSON.stringify(value);
        }

        this.data.push('^' + path + '/' + property + ' : ' + description);
        return this;
    };

    this.removeProperty = function (path, property) {
        if (!path) {
            throw new TypeError('path required as first argument');
        }

        if (!property) {
            throw new TypeError('property name required as second argument');
        }

        this.data.push('-' + path + '/' + property + ' : ');
        return this;
    };

    this.getFormData = function () {
        this.formData.append(':diff', this.data.join('\n'), {contentType: 'jcr-value/binary'});
        return this.formData;
    };

    this.toString = function () {
        return this.data.join('\n');
    };
}

module.exports = CRXPayload;