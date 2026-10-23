# SpecBatch Free for After Effects

Create blank compositions from CSV specifications, with a checked preview before creation.

For motion designers setting up a delivery list with different sizes, frame rates and durations. **Creates empty comps only:** it does not resize existing designs, replace text, import footage or render.

![Actual After Effects output](native-output.jpg)

## Download and run

1. Download the [v0.1 package](https://github.com/kaorukaore-x/specbatch-after-effects/releases/latest), or choose **Code → Download ZIP**.
2. Keep `SpecBatch.jsx` and `SpecBatchCore.js` in the same folder.
3. Save your work and open a separate test project in After Effects.
4. Choose **File → Scripts → Run Script File** and open `SpecBatch.jsx`.
5. Paste your CSV, choose **Validate & preview**, inspect the settings, then **Create checked batch**.

No installer, account or network request is required by the script. After Effects itself is required and is not included.

```csv
name,width,height,fps,frames
Hero_16x9,1920,1080,25,250
Story_9x16,1080,1920,30,300
"Launch, EN",1080,1080,23.976,240
```

A new folder holds the new comps. Existing items are not edited. To undo, close the palette, focus the main Project panel and use **Edit → Undo** once per batch.

## Tested and untested

Tested in **After Effects 2026 on macOS**: five specs across two batches, including 3840×2160 at59.94fps, Japanese names, quoted commas and a one-frame comp. Actual comp settings were read back. Duplicate names and invalid width/fps were rejected; two batches were undone.

Windows, other AE versions, the file-picker CSV workflow, 200-row batches, and failure rollback are **unverified**. Limits in the code are not a claim that every boundary was tested. See [START_HERE.txt](START_HERE.txt).

## Optional motion background

Need an actual rendered background rather than blank comps? [Chrome Orbit — 4K and portrait MP4 pack ($5)](https://sola35.gumroad.com/l/chrome-orbit-4k-motion-loop?utm_source=github&utm_medium=opensource_readme&utm_campaign=ae_workflow_20261024&utm_content=optional_motion_pack) is a separate, optional paid asset. It is **not needed** to run this utility and its proprietary asset license is separate from this repository’s MIT code license.

## License and feedback

[MIT](LICENSE.txt). Original SOLA111 code with AI-assisted development. Not affiliated with Adobe. No bundled competitor code, stock imagery, fonts, templates or media.

Open an issue with your AE version, OS and a small non-confidential CSV example. Support and compatibility updates are not guaranteed. Do not include client files or personal information.
