/* SpecBatch v0.1 - original SOLA implementation. ES3-compatible. */
var SpecBatchCore = (function () {
    function fail(message) { throw new Error(message); }
    function trim(s) { return String(s).replace(/^\s+|\s+$/g, ''); }
    function parse(text) {
        text = String(text).replace(/^\uFEFF/, '');
        var rows = [], row = [], field = '', quoted = false, closed = false, i, c;
        for (i = 0; i < text.length; i++) {
            c = text.charAt(i);
            if (quoted) {
                if (c === '"') { if (text.charAt(i + 1) === '"') { field += '"'; i++; } else { quoted = false; closed = true; } }
                else { field += c; }
            } else if (c === '"') {
                if (field !== '' || closed) { fail('Unexpected quote near character ' + (i + 1)); }
                quoted = true;
            } else if (c === ',' || c === '\n' || c === '\r') {
                row.push(field); field = ''; closed = false;
                if (c !== ',') { rows.push(row); row = []; if (c === '\r' && text.charAt(i + 1) === '\n') { i++; } }
            } else {
                if (closed) { fail('Unexpected text after closing quote near character ' + (i + 1)); }
                field += c;
            }
        }
        if (quoted) { fail('Unclosed quoted field.'); }
        if (field !== '' || row.length || closed) { row.push(field); rows.push(row); }
        return rows;
    }
    function prepare(text, existingNames) {
        var rows = parse(text), errors = [], specs = [], required = ['name','width','height','fps','frames'], cols = {}, seen = {}, i, j, row, s, n, key;
        if (!rows.length) { fail('CSV is empty.'); }
        for (i = 0; i < rows[0].length; i++) {
            key = trim(rows[0][i]).toLowerCase();
            if (typeof cols['k:' + key] !== 'undefined') { errors.push('Duplicate header: ' + key); }
            cols['k:' + key] = i;
        }
        for (i = 0; i < required.length; i++) { if (typeof cols['k:' + required[i]] === 'undefined') { errors.push('Missing header: ' + required[i]); } }
        if (rows[0].length !== required.length) { errors.push('Use exactly five columns: name,width,height,fps,frames'); }
        if (errors.length) { return {specs:[],errors:errors}; }
        function numberValue(value, label, rowNum, min, max, integer) {
            if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(trim(value))) { errors.push('Row ' + rowNum + ': ' + label + ' must be a plain positive number.'); return null; }
            n = Number(value);
            if (!isFinite(n) || n < min || n > max || (integer && Math.floor(n) !== n)) { errors.push('Row ' + rowNum + ': ' + label + ' out of range (' + min + '–' + max + (integer ? ', integer' : '') + ').'); return null; }
            return n;
        }
        for (i = 1; i < rows.length; i++) {
            row = rows[i]; var empty = true;
            for (j = 0; j < row.length; j++) { if (trim(row[j]) !== '') { empty = false; } }
            if (empty) { continue; }
            if (specs.length >= 200) { errors.push('Maximum 200 non-empty rows per batch.'); break; }
            if (row.length !== 5) { errors.push('Row ' + (i + 1) + ': expected five CSV fields, got ' + row.length + '.'); continue; }
            s = {row:i+1,name:trim(row[cols['k:name']])};
            if (!s.name || /[\x00-\x1F\x7F]/.test(s.name) || s.name.length > 120) { errors.push('Row ' + s.row + ': name needs 1–120 characters with no control characters.'); }
            key = 'n:' + s.name;
            if (seen[key]) { errors.push('Row ' + s.row + ': duplicate batch name: ' + s.name); }
            seen[key] = true;
            for (j = 0; j < existingNames.length; j++) { if (existingNames[j] === s.name) { errors.push('Row ' + s.row + ': composition already exists: ' + s.name); break; } }
            s.width = numberValue(row[cols['k:width']], 'width', s.row, 4, 30000, true);
            s.height = numberValue(row[cols['k:height']], 'height', s.row, 4, 30000, true);
            s.fps = numberValue(row[cols['k:fps']], 'fps', s.row, 1, 99, false);
            s.frames = numberValue(row[cols['k:frames']], 'frames', s.row, 1, 1000000, true);
            if (s.frames !== null && s.fps !== null && s.frames / s.fps > 10800) { errors.push('Row ' + s.row + ': duration exceeds 10800 seconds.'); }
            specs.push(s);
        }
        if (!specs.length && !errors.length) { errors.push('No data rows.'); }
        return {specs:specs,errors:errors};
    }
    return {parse:parse,prepare:prepare};
}());
if (typeof module !== 'undefined' && module.exports) { module.exports = SpecBatchCore; }
