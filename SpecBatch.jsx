#target aftereffects
#include "SpecBatchCore.js"
/* Original SOLA code. Creates only new blank comps. No network access, no existing item edits. */
(function () {
    var win = new Window('palette', 'SOLA SpecBatch · v0.1', undefined, {resizeable:true});
    win.orientation = 'column'; win.alignChildren = ['fill','top']; win.spacing = 12; win.margins = 20;
    var intro = win.add('statictext', undefined, 'CSV specs → checked preview → blank compositions');
    var hint = win.add('statictext', undefined, 'Five columns: name,width,height,fps,frames. Up to 200 rows. Square pixels only.');
    var input = win.add('edittext', undefined, 'name,width,height,fps,frames\nHero_16x9,1920,1080,25,250\nStory_9x16,1080,1920,30,300\n"Launch, EN",1080,1080,23.976,240', {multiline:true,scrolling:true});
    input.preferredSize = [760,145];
    var buttons = win.add('group');
    var load = buttons.add('button', undefined, 'Load CSV…');
    var check = buttons.add('button', undefined, 'Validate & preview');
    var create = buttons.add('button', undefined, 'Create checked batch'); create.enabled = false;
    var preview = win.add('edittext', undefined, 'Validate first. No existing composition will be changed.', {multiline:true,scrolling:true,readonly:true}); preview.preferredSize = [760,200];
    var note = win.add('statictext', undefined, 'Creates empty comps only. No templates, resizing, layers, renders or media imports. One Undo reverts the batch.');
    var prepared = null, checkedText = '';
    function existing() { var a = [], i; if (app.project) { for(i=1;i<=app.project.numItems;i++){if(app.project.item(i) instanceof CompItem){a.push(app.project.item(i).name);}} } return a; }
    function invalidate() { create.enabled = false; prepared = null; }
    input.onChanging = invalidate;
    load.onClick = function () {
        var f = File.openDialog('Choose UTF-8 CSV', '*.csv'); if (!f) { return; }
        if (f.length > 1024*1024) { alert('Maximum CSV size is 1 MB.'); return; }
        f.encoding = 'UTF-8'; if (!f.open('r')) { alert('Could not read this file.'); return; }
        try { input.text = f.read(); invalidate(); preview.text = 'CSV loaded. Validate before creating.'; } finally { f.close(); }
    };
    function validate() {
        invalidate();
        try {
            prepared = SpecBatchCore.prepare(input.text, existing());
            if (prepared.errors.length) { preview.text = 'NOT READY — no compositions created\n\n' + prepared.errors.join('\n'); return false; }
            var out = [], i, s;
            for (i=0;i<prepared.specs.length;i++) { s=prepared.specs[i]; out.push(s.name+'  |  '+s.width+' × '+s.height+'  |  '+s.fps+' fps  |  '+s.frames+' frames  |  '+(s.frames/s.fps).toFixed(6)+' sec'); }
            preview.text = 'READY: '+prepared.specs.length+' new blank compositions\n\n'+out.join('\n'); checkedText = input.text; create.enabled = true; return true;
        } catch (e) { preview.text = 'NOT READY — no compositions created\n\n'+e.message; return false; }
    }
    check.onClick = validate;
    create.onClick = function () {
        if (input.text !== checkedText || !validate()) { return; }
        if (!confirm('Create '+prepared.specs.length+' NEW blank compositions in a new SpecBatch folder?\n\nNo existing items are edited. Use Edit > Undo to revert.')) { return; }
        if (!app.project) { app.newProject(); }
        var folder, created = [], i, s, comp, out = [], failed = null;
        app.beginUndoGroup('SOLA SpecBatch');
        try {
            folder = app.project.items.addFolder('SpecBatch '+(new Date()).getTime());
            for(i=0;i<prepared.specs.length;i++) {
                s=prepared.specs[i]; comp=app.project.items.addComp(s.name,s.width,s.height,1,s.frames/s.fps,s.fps); created.push(comp); comp.parentFolder=folder;
                if (comp.width !== s.width || comp.height !== s.height || Math.abs(comp.frameRate-s.fps)>0.00001 || Math.abs(comp.duration*comp.frameRate-s.frames)>0.001) { throw new Error('AE returned settings different from the requested spec: '+s.name); }
                out.push(comp.name+' | '+comp.width+' × '+comp.height+' | '+comp.frameRate+' fps | '+(comp.duration*comp.frameRate).toFixed(3)+' frames');
            }
        } catch(e) {
            failed=e.message;
            for(i=created.length-1;i>=0;i--){try{created[i].remove();}catch(cleanupError){failed+='\nCleanup needed: use Undo.';}}
            if(folder){try{folder.remove();}catch(folderError){failed+='\nFolder cleanup needed: use Undo.';}}
        } finally { app.endUndoGroup(); }
        invalidate();
        preview.text=failed ? 'Creation failed; attempted rollback.\n'+failed : 'CREATED '+out.length+' — actual settings read back from After Effects\n\n'+out.join('\n')+'\n\nNo existing items edited. Edit > Undo: SOLA SpecBatch.';
    };
    win.onResizing=win.onResize=function(){this.layout.resize();};
    win.center(); win.show();
}());
