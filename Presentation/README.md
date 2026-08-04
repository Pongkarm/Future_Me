# FutureMe AI presentation

Final deliverables:

- `FutureMe_Project_Presentation.pptx` — editable 16:9 presentation
- `FutureMe_Project_Presentation.pdf` — final 15-page export
- `generate_presentation.py` — editable deck generator
- `rendered/` — page-by-page PNG renders used for visual QA

The deck synthesizes the audited materials in `01_Research/Data/` and checks
current product claims against the runnable prototype in `03_WebApp/Pre_Present/`.
Current capabilities and planned architecture are deliberately separated.

## Rebuild

Requirements:

- Python 3
- LibreOffice (`soffice`)

Run:

```sh
./build.sh
```

The script creates a local virtual environment, regenerates the editable PPTX,
and exports the PDF with LibreOffice.
