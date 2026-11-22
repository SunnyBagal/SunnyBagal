# Profile assets

Every image in the profile README is a self-hosted SVG generated here:
fonts are embedded and subset, and each image has a wide and a narrow (mobile) variant.

```bash
cd tools
npm install
npm run build   # regenerates ../assets/*.svg and ../README.md
```

Edit the numbers in `PROJECTS`, the skills in `STACK`, or the colours in `C` inside `gen.mjs`.
The build prints `OVERFLOW:` if any text no longer fits its tile.
The banner lives in `header.mjs`; everything else in `gen.mjs`.
Fonts: Chakra Petch and JetBrains Mono (SIL Open Font License).
